import type { NewsItem, YouTubeVideo } from "../types"
import { analyzeSentiment } from "../analysis/sentiment"
import { analyzeCredibility } from "../analysis/credibility"
import { apiClient, ApiError } from "../api-client"

export async function fetchYouTubeVideos(query: string): Promise<NewsItem[]> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      throw new Error("YouTube API key is not configured")
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`

    const data = await apiClient.get(url, { cacheTime: 3600 }) // Cache for 1 hour

    if (!data.items || !Array.isArray(data.items)) {
      return []
    }

    // Process and analyze each video
    const videoPromises = data.items.map(async (item: YouTubeVideo) => {
      const content = `${item.snippet.title} ${item.snippet.description}`

      try {
        // Analyze sentiment and credibility in parallel
        const [sentiment, credibility] = await Promise.all([analyzeSentiment(content), analyzeCredibility(content)])

        return {
          id: `youtube-${item.id.videoId}`,
          title: item.snippet.title,
          description: item.snippet.description,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          source: "youtube" as const,
          date: item.snippet.publishedAt,
          sentiment,
          credibility,
          rawContent: content,
          thumbnail: item.snippet.thumbnails?.medium?.url || null,
        }
      } catch (error) {
        console.error(`Error processing YouTube video: ${item.snippet.title}`, error)
        // Return item with default values for sentiment and credibility
        return {
          id: `youtube-${item.id.videoId}`,
          title: item.snippet.title,
          description: item.snippet.description,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          source: "youtube" as const,
          date: item.snippet.publishedAt,
          sentiment: "neutral" as const,
          credibility: "medium" as const,
          rawContent: content,
          thumbnail: item.snippet.thumbnails?.medium?.url || null,
        }
      }
    })

    // Use Promise.allSettled to handle individual item failures
    const results = await Promise.allSettled(videoPromises)

    return results
      .filter((result): result is PromiseFulfilledResult<NewsItem> => result.status === "fulfilled")
      .map((result) => result.value)
  } catch (error) {
    console.error("Error fetching YouTube videos:", error)
    if (error instanceof ApiError && error.status === 429) {
      throw new Error("YouTube API rate limit exceeded. Please try again later.")
    }
    throw new Error("Failed to fetch videos from YouTube")
  }
}
