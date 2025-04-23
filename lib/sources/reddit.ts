import type { NewsItem, RedditPost } from "../types"
import { analyzeSentiment } from "../analysis/sentiment"
import { analyzeCredibility } from "../analysis/credibility"
import { apiClient, ApiError } from "../api-client"

export async function fetchRedditPosts(query: string): Promise<NewsItem[]> {
  try {
    // Reddit's API doesn't require authentication for public data
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10`

    const data = await apiClient.get(url, {
      cacheTime: 3600, // Cache for 1 hour
      headers: {
        "User-Agent": "OSINT News Analyzer/1.0",
      },
    })

    if (!data.data || !data.data.children || !Array.isArray(data.data.children)) {
      return []
    }

    // Process and analyze each post
    const postPromises = data.data.children.map(async (post: { data: RedditPost["data"] }) => {
      const content = post.data.selftext || post.data.title

      try {
        // Analyze sentiment and credibility in parallel
        const [sentiment, credibility] = await Promise.all([analyzeSentiment(content), analyzeCredibility(content)])

        return {
          id: `reddit-${post.data.id}`,
          title: post.data.title,
          description: post.data.selftext.substring(0, 200) + (post.data.selftext.length > 200 ? "..." : ""),
          url: `https://www.reddit.com${post.data.url}`,
          source: "reddit" as const,
          date: new Date(post.data.created_utc * 1000).toISOString(),
          sentiment,
          credibility,
          rawContent: content,
        }
      } catch (error) {
        console.error(`Error processing Reddit post: ${post.data.title}`, error)
        // Return item with default values for sentiment and credibility
        return {
          id: `reddit-${post.data.id}`,
          title: post.data.title,
          description: post.data.selftext.substring(0, 200) + (post.data.selftext.length > 200 ? "..." : ""),
          url: `https://www.reddit.com${post.data.url}`,
          source: "reddit" as const,
          date: new Date(post.data.created_utc * 1000).toISOString(),
          sentiment: "neutral" as const,
          credibility: "medium" as const,
          rawContent: content,
        }
      }
    })

    // Use Promise.allSettled to handle individual item failures
    const results = await Promise.allSettled(postPromises)

    return results
      .filter((result): result is PromiseFulfilledResult<NewsItem> => result.status === "fulfilled")
      .map((result) => result.value)
  } catch (error) {
    console.error("Error fetching Reddit posts:", error)
    if (error instanceof ApiError && error.status === 429) {
      throw new Error("Reddit API rate limit exceeded. Please try again later.")
    }
    throw new Error("Failed to fetch posts from Reddit")
  }
}
