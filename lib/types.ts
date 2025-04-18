export type NewsSource = "google" | "reddit" | "youtube"
export type Sentiment = "positive" | "neutral" | "negative"
export type Credibility = "high" | "medium" | "low"

export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  source: NewsSource
  date?: string
  sentiment: Sentiment
  credibility: Credibility
  rawContent?: string
}

export interface GoogleNewsItem {
  title: string
  link: string
  snippet: string
  source: {
    title: string
  }
  pagemap?: {
    metatags?: Array<{
      "article:published_time"?: string
      "og:updated_time"?: string
      "datePublished"?: string
      "dateModified"?: string
      [key: string]: string | undefined
    }>
  }
}

export interface RedditPost {
  data: {
    id: string
    title: string
    selftext: string
    url: string
    permalink: string
    created_utc: number
    subreddit: string
  }
}

export interface YouTubeVideo {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    description: string
    publishedAt: string
    channelTitle: string
  }
}

export interface SentimentAnalysisResult {
  label: string
  score: number
}

export interface CredibilityAnalysisResult {
  label: string
  score: number
}

// Add types for fetch options
export interface FetchOptions extends RequestInit {
  next?: {
    revalidate?: number
  }
}
