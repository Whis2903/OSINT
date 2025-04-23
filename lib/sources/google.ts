import type { NewsItem, GoogleNewsItem } from "../types"
import { analyzeSentiment } from "../analysis/sentiment"
import { analyzeCredibility } from "../analysis/credibility"
import { apiClient, ApiError } from "../api-client"

export async function fetchGoogleNews(query: string): Promise<NewsItem[]> {
  try {
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
    const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID

    if (!apiKey || !searchEngineId) {
      throw new Error("Google API key or Search Engine ID is not configured")
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`

    const data = await apiClient.get(url, { cacheTime: 3600 }) // Cache for 1 hour

    if (!data.items || !Array.isArray(data.items)) {
      return []
    }

    // Process and analyze each news item
    const newsPromises = data.items.map(async (item: GoogleNewsItem) => {
      const content = item.snippet || item.title

      try {
        // Analyze sentiment and credibility in parallel
        const [sentiment, credibility] = await Promise.all([analyzeSentiment(content), analyzeCredibility(content)])

        // Extract date if available
        let date = undefined
        if (item.pagemap?.metatags?.[0]?.["article:published_time"]) {
          date = item.pagemap.metatags[0]["article:published_time"]
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
        console.error(`Error processing Google news item: ${item.title}`, error)
        // Return item with default values for sentiment and credibility
        return {
          id: `google-${Buffer.from(item.link).toString("base64")}`,
          title: item.title,
          description: item.snippet,
          url: item.link,
          source: "google" as const,
          date: undefined,
          sentiment: "neutral" as const,
          credibility: "medium" as const,
          rawContent: content,
        }
      }
    })

    // Use Promise.allSettled to handle individual item failures
    const results = await Promise.allSettled(newsPromises)

    return results
      .filter((result): result is PromiseFulfilledResult<NewsItem> => result.status === "fulfilled")
      .map((result) => result.value)
  } catch (error) {
    console.error("Error fetching Google News:", error)
    if (error instanceof ApiError && error.status === 429) {
      throw new Error("Google API rate limit exceeded. Please try again later.")
    }
    throw new Error("Failed to fetch news from Google")
  }
}
