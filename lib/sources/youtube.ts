import type { NewsItem, YouTubeVideo, FetchOptions } from "../types"
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
    throw new Error('YouTube API rate limit exceeded. Please try again later.')
  }
  
  requestCount++
}

interface YouTubeVideoDetails {
  id: string
  snippet: {
    description: string
  }
}

export async function fetchYouTubeVideos(query: string): Promise<NewsItem[]> {
  try {
    checkRateLimit()

    const apiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyDWzj5yn6Zr32DVfQ_fk0E9kLZ14mkHQn4'
    
    // Add news-specific parameters to the query
    const searchQuery = `${query} news`
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(searchQuery)}&type=video&key=${apiKey}&order=date&relevanceLanguage=en`

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
        `YouTube API error: ${response.status} ${response.statusText}${errorData?.error?.message ? ` - ${errorData.error.message}` : ''}`
      )
    }

    const data = await response.json()

    if (!data.items || !Array.isArray(data.items)) {
      console.warn('No videos found in YouTube response')
      return []
    }

    // Get video details for each item
    const videoIds = data.items.map((item: YouTubeVideo) => item.id.videoId).join(',')
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`
    
    const detailsResponse = await fetch(detailsUrl, options)
    if (!detailsResponse.ok) {
      throw new Error('Failed to fetch video details')
    }
    
    const detailsData = await detailsResponse.json()
    const videoDetails = new Map<string, YouTubeVideoDetails>(
      detailsData.items.map((video: YouTubeVideoDetails) => [video.id, video])
    )

    // Process and analyze each video
    const youtubeVideos = await Promise.all(
      data.items.map(async (item: YouTubeVideo) => {
        try {
          const videoDetail = videoDetails.get(item.id.videoId)
          const description = videoDetail?.snippet?.description || item.snippet.description
          
          // Combine title and description for better analysis
          const content = `${item.snippet.title}\n${description}`

          // Analyze sentiment and credibility in parallel
          const [sentiment, credibility] = await Promise.all([
            analyzeSentiment(content),
            analyzeCredibility(content)
          ])

          return {
            id: `youtube-${item.id.videoId}`,
            title: item.snippet.title,
            description: description,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            source: "youtube" as const,
            date: item.snippet.publishedAt,
            sentiment,
            credibility,
            rawContent: content,
          }
        } catch (error) {
          console.error('Error processing YouTube video:', error)
          return null
        }
      })
    )

    // Filter out any failed videos
    return youtubeVideos.filter((video): video is NewsItem => video !== null)
  } catch (error) {
    console.error("Error fetching YouTube videos:", error)
    throw new Error(`Failed to fetch videos from YouTube: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
