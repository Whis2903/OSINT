import type { NewsItem, RedditPost, FetchOptions, Sentiment, Credibility } from "../types"
import { analyzeSentiment } from "../analysis/sentiment"
import { analyzeCredibility } from "../analysis/credibility"

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 10,
  windowMs: 60000, // 1 minute
}

let requestCount = 0
let lastResetTime = Date.now()
let accessToken = ''
let tokenExpiry = 0

async function getAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  const refreshToken = process.env.REDDIT_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Reddit API credentials are not configured")
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Reddit access token')
  }

  const data = await response.json()
  accessToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // Subtract 1 minute for safety
  return accessToken
}

function checkRateLimit() {
  const now = Date.now()
  if (now - lastResetTime >= RATE_LIMIT.windowMs) {
    requestCount = 0
    lastResetTime = now
  }
  
  if (requestCount >= RATE_LIMIT.requests) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }
  
  requestCount++
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost["data"]
    }>
  }
}

export async function fetchRedditPosts(query: string): Promise<NewsItem[]> {
  try {
    checkRateLimit()
    const token = await getAccessToken()

    const url = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=relevance&limit=10&type=link`

    const options: FetchOptions = {
      next: { revalidate: 3600 },
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'OSINT News Analyzer/1.0',
        'Accept': 'application/json',
      },
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        `Reddit API error: ${response.status} ${response.statusText}${errorData?.error ? ` - ${errorData.error}` : ''}`
      )
    }

    const data = await response.json() as RedditResponse

    if (!data.data?.children || !Array.isArray(data.data.children)) {
      console.warn('No posts found in Reddit response')
      return []
    }

    // Process posts in batches to avoid overwhelming the API
    const batchSize = 3
    const posts = data.data.children
    const processedPosts: NewsItem[] = []

    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(async (post) => {
          try {
            const content = post.data.selftext || post.data.title
            if (!content) return null

            // Analyze sentiment and credibility in parallel with timeout
            const [sentiment, credibility] = await Promise.race([
              Promise.all([
                analyzeSentiment(content),
                analyzeCredibility(content)
              ]),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Analysis timeout')), 30000)
              )
            ]).catch(() => ['neutral' as Sentiment, 'medium' as Credibility])

            return {
              id: `reddit-${post.data.id}`,
              title: post.data.title,
              description: post.data.selftext?.substring(0, 200) + (post.data.selftext?.length > 200 ? "..." : "") || "",
              url: `https://www.reddit.com${post.data.permalink}`,
              source: "reddit" as const,
              date: new Date(post.data.created_utc * 1000).toISOString(),
              sentiment,
              credibility,
              rawContent: content,
            } as NewsItem
          } catch (error) {
            console.error('Error processing Reddit post:', error)
            return null
          }
        })
      )

      // Filter out null results and add to processed posts
      processedPosts.push(...batchResults.filter((post): post is NewsItem => post !== null))

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < posts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return processedPosts
  } catch (error) {
    console.error("Error fetching Reddit posts:", error)
    throw new Error(`Failed to fetch posts from Reddit: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
