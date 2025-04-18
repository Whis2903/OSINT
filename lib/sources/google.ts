import type { NewsItem, GoogleNewsItem, FetchOptions } from "../types"
import { analyzeSentiment } from "../analysis/sentiment"
import { analyzeCredibility } from "../analysis/credibility"

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 100,
  windowMs: 60000, // 1 minute
}

let requestCount = 0
let lastResetTime = Date.now()

function checkRateLimit() {
  const now = Date.now()
  if (now - lastResetTime >= RATE_LIMIT.windowMs) {
    requestCount = 0
    lastResetTime = now
  }
  
  if (requestCount >= RATE_LIMIT.requests) {
    throw new Error('Google Custom Search API rate limit exceeded. Please try again later.')
  }
  
  requestCount++
}

export async function fetchGoogleNews(query: string): Promise<NewsItem[]> {
  try {
    checkRateLimit()

    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || 'AIzaSyBmkJmSZOw8OK6NO84ZWnRM6sz3OR-Chrk'
    const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '02ea0c98848dd4282'

    // Add news-specific parameters to the query
    const searchQuery = `${query} news -site:youtube.com -site:reddit.com`
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10&sort=date`

    const options: FetchOptions = {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Accept': 'application/json',
      }
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        `Google Custom Search API error: ${response.status} ${response.statusText}${errorData?.error?.message ? ` - ${errorData.error.message}` : ''}`
      )
    }

    const data = await response.json()

    if (!data.items || !Array.isArray(data.items)) {
      console.warn('No items found in Google Custom Search response')
      return []
    }

    // Process and analyze each news item
    const newsItems = await Promise.all(
      data.items.map(async (item: GoogleNewsItem) => {
        try {
          const content = item.snippet || item.title

          // Analyze sentiment and credibility in parallel
          const [sentiment, credibility] = await Promise.all([
            analyzeSentiment(content),
            analyzeCredibility(content)
          ])

          // Extract date from various possible sources
          let date = undefined
          const metaTags = item.pagemap?.metatags?.[0]
          if (metaTags) {
            date = metaTags["article:published_time"] || 
                   metaTags["og:updated_time"] || 
                   metaTags["datePublished"] ||
                   metaTags["dateModified"]
          }

          return {
            id: `google-${Buffer.from(item.link).toString("base64")}`,
            title: item.title,
            description: item.snippet,
            url: item.link,
            source: "google" as const,
            date,
            sentiment,
            credibility,
            rawContent: content,
          }
        } catch (error) {
          console.error('Error processing Google News item:', error)
          return null
        }
      })
    )

    // Filter out any failed items
    return newsItems.filter((item): item is NewsItem => item !== null)
  } catch (error) {
    console.error("Error fetching Google News:", error)
    throw new Error(`Failed to fetch news from Google: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
