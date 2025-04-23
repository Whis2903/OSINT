import type { NewsItem, Newspaper, Sentiment, Credibility } from "../types"
import { analyzeSentiment } from "../analysis/sentiment"
import { analyzeCredibility } from "../analysis/credibility"
import { ApiError } from "../api-client"
import { parse } from "node-html-parser"

// Pakistani newspaper sources
export const PAKISTANI_NEWSPAPERS: Newspaper[] = [
  {
    id: "dawn",
    name: "Dawn",
    url: "https://www.dawn.com",
    country: "Pakistan",
    language: "English",
    logo: "/newspapers/dawn-logo.png",
    category: "general",
  },
  {
    id: "tribune",
    name: "The Express Tribune",
    url: "https://tribune.com.pk",
    country: "Pakistan",
    language: "English",
    logo: "/newspapers/tribune-logo.png",
    category: "general",
  },
  {
    id: "thenews",
    name: "The News International",
    url: "https://www.thenews.com.pk",
    country: "Pakistan",
    language: "English",
    logo: "/newspapers/thenews-logo.png",
    category: "general",
  },
  {
    id: "nation",
    name: "The Nation",
    url: "https://nation.com.pk",
    country: "Pakistan",
    language: "English",
    logo: "/newspapers/nation-logo.png",
    category: "general",
  },
  {
    id: "business",
    name: "Business Recorder",
    url: "https://www.brecorder.com",
    country: "Pakistan",
    language: "English",
    logo: "/newspapers/business-recorder-logo.png",
    category: "business",
  },
  {
    id: "geo",
    name: "Geo News",
    url: "https://www.geo.tv",
    country: "Pakistan",
    language: "English",
    logo: "/newspapers/geo-logo.png",
    category: "news",
  },
]

export async function fetchNewspapers(): Promise<NewsItem[]> {
  try {
    const allNewsPromises = PAKISTANI_NEWSPAPERS.map(async (paper) => {
      try {
        return await scrapeNewspaperHeadlines(paper)
      } catch (error) {
        console.error(`Error scraping ${paper.name}:`, error)
        return []
      }
    })

    const results = await Promise.allSettled(allNewsPromises)

    return results
      .filter((result): result is PromiseFulfilledResult<NewsItem[]> => result.status === "fulfilled")
      .flatMap((result) => result.value)
  } catch (error) {
    console.error("Error fetching newspaper content:", error)
    return []
  }
}

async function scrapeNewspaperHeadlines(newspaper: Newspaper): Promise<NewsItem[]> {
  try {
    const response = await fetch(newspaper.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new ApiError(`Failed to fetch ${newspaper.name} content`, response.status)
    }

    const html = await response.text()
    const root = parse(html)

    // Different parsing strategies for different newspapers
    const headlines: NewsItem[] = []
    const now = new Date().toISOString()

    try {
      // Generic approach - look for headline elements
      const articleElements = root.querySelectorAll("article, .story, .headline, .article, .news-item")

      for (let i = 0; i < Math.min(10, articleElements.length); i++) {
        const article = articleElements[i]

        // Try to find title, link, and description using common patterns
        const titleElement = article.querySelector("h1, h2, h3, .title, .headline")
        const linkElement = article.querySelector("a")
        const descriptionElement = article.querySelector("p, .summary, .description, .excerpt")
        const imageElement = article.querySelector("img")

        if (titleElement && linkElement) {
          const title = titleElement.textContent.trim()
          let url = linkElement.getAttribute("href") || ""
          if (!url.startsWith("http")) {
            url = newspaper.url + (url.startsWith("/") ? url : "/" + url)
          }

          const description = descriptionElement ? descriptionElement.textContent.trim() : ""
          const thumbnailUrl = imageElement ? imageElement.getAttribute("src") : null
          const thumbnail =
            thumbnailUrl && !thumbnailUrl.startsWith("http")
              ? newspaper.url + (thumbnailUrl.startsWith("/") ? thumbnailUrl : "/" + thumbnailUrl)
              : thumbnailUrl

          const content = `${title} ${description}`
          const [sentiment, credibility] = await Promise.all([analyzeSentiment(content), analyzeCredibility(content)])

          headlines.push({
            id: `newspaper-${newspaper.id}-${Buffer.from(url).toString("base64").substring(0, 10)}`,
            title,
            description: description || "No description available",
            url,
            source: "newspaper",
            date: now,
            sentiment,
            credibility,
            newspaper: newspaper.name,
            category: newspaper.category,
            thumbnail: thumbnail || null,
            rawContent: content,
          })
        }
      }
    } catch (error) {
      console.error(`Error parsing ${newspaper.name}:`, error)
    }

    return headlines
  } catch (error) {
    console.error(`Error scraping ${newspaper.name}:`, error)
    return []
  }
}

export async function fetchNewspaperByDate(date: string): Promise<NewsItem[]> {
  // In a real application, this would fetch from a database or archive
  // For this demo, we'll simulate historical data

  try {
    // Convert the requested date to a Date object
    const requestedDate = new Date(date)
    const today = new Date()

    // If the requested date is today, just return the current news
    if (requestedDate.toDateString() === today.toDateString()) {
      return fetchNewspapers()
    }

    // For past dates, we'll simulate archived news
    // In a real app, this would retrieve from a database
    const archived = await simulateArchivedNews(date)
    return archived
  } catch (error) {
    console.error(`Error fetching newspapers for date ${date}:`, error)
    return []
  }
}

async function simulateArchivedNews(dateString: string): Promise<NewsItem[]> {
  const date = new Date(dateString)
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Create simulated archived headlines
  const archivedNews: NewsItem[] = []

  for (const paper of PAKISTANI_NEWSPAPERS) {
    // Generate 2-3 simulated headlines per newspaper
    const headlineCount = 2 + Math.floor(Math.random() * 2)

    for (let i = 0; i < headlineCount; i++) {
      const title = `${paper.name} headline from ${formattedDate} - ${i + 1}`
      const description = `This is a simulated archived news item from ${paper.name} dated ${formattedDate}.`
      const url = `${paper.url}/archives/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`

      const content = `${title} ${description}`
      const sentiment = ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)] as Sentiment
      const credibility = ["high", "medium", "low"][Math.floor(Math.random() * 3)] as Credibility

      archivedNews.push({
        id: `archived-${paper.id}-${date.getTime()}-${i}`,
        title,
        description,
        url,
        source: "newspaper",
        date: date.toISOString(),
        sentiment,
        credibility,
        newspaper: paper.name,
        category: paper.category,
        thumbnail: null,
        rawContent: content,
      })
    }
  }

  return archivedNews
}
