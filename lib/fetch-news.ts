import { cache } from "react"
import type { NewsItem, NewsSource } from "./types"
import { fetchGoogleNews } from "./sources/google"
import { fetchRedditPosts } from "./sources/reddit"
import { fetchYouTubeVideos } from "./sources/youtube"

// Cache the news fetching for 5 minutes
export const fetchNews = cache(
  async (
    query: string,
    sourceFilter = "all",
    sentimentFilter = "all",
    credibilityFilter = "all",
  ): Promise<NewsItem[]> => {
    if (!query) return []

    // Determine which sources to fetch from
    const fetchSources: NewsSource[] =
      sourceFilter === "all" ? ["google", "reddit", "youtube"] : [sourceFilter as NewsSource]

    // Fetch from all requested sources in parallel
    const results = await Promise.allSettled(
      fetchSources.map(async (source) => {
        try {
          switch (source) {
            case "google":
              return await fetchGoogleNews(query)
            case "reddit":
              return await fetchRedditPosts(query)
            case "youtube":
              return await fetchYouTubeVideos(query)
            default:
              return []
          }
        } catch (error) {
          console.error(`Error fetching from ${source}:`, error)
          return []
        }
      }),
    )

    // Combine and process results
    let allNews: NewsItem[] = []

    for (const result of results) {
      if (result.status === "fulfilled") {
        allNews = [...allNews, ...result.value]
      }
    }

    // Apply filters if specified
    if (sentimentFilter !== "all") {
      allNews = allNews.filter((item) => item.sentiment === sentimentFilter)
    }

    if (credibilityFilter !== "all") {
      allNews = allNews.filter((item) => item.credibility === credibilityFilter)
    }

    return allNews
  },
)
