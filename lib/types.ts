export type NewsSource = "google" | "reddit" | "youtube"
export type Sentiment = "positive" | "neutral" | "negative"
export type Credibility = "high" | "medium" | "low"

export interface Keyword {
  id: string
  text: string
  createdAt: string
  lastUpdated: string
}

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
  thumbnail?: string | null
  keywordId?: string
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
    }>
    cse_image?: Array<{
      src?: string
    }>
  }
}

export interface RedditPost {
  data: {
    id: string
    title: string
    selftext: string
    url: string
    created_utc: number
    subreddit: string
    thumbnail?: string
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
    thumbnails?: {
      default?: { url: string; width: number; height: number }
      medium?: { url: string; width: number; height: number }
      high?: { url: string; width: number; height: number }
    }
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

export interface KeywordResults {
  keyword: Keyword
  results: NewsItem[]
  lastUpdated: string
}
