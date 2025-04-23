"use client"

import { fetchNews } from "../fetch-news"
import { KeywordService } from "./keyword-service"

export const UpdateService = {
  updateAllKeywords: async (): Promise<{ success: number; failed: number }> => {
    const keywords = KeywordService.getKeywords()
    let success = 0
    let failed = 0

    // Process each keyword
    const results = await Promise.allSettled(
      keywords.map(async (keyword) => {
        try {
          // Fetch news for this keyword
          const newsItems = await fetchNews(keyword.text)

          // Save the results
          KeywordService.saveKeywordResults(keyword.id, newsItems)
          return true
        } catch (error) {
          console.error(`Error fetching news for keyword "${keyword.text}":`, error)
          throw error
        }
      }),
    )

    // Count successful and failed updates
    success = results.filter((r) => r.status === "fulfilled").length
    failed = results.filter((r) => r.status === "rejected").length

    return { success, failed }
  },

  updateKeyword: async (keywordId: string): Promise<boolean> => {
    const keywords = KeywordService.getKeywords()
    const keyword = keywords.find((k) => k.id === keywordId)

    if (!keyword) {
      throw new Error(`Keyword with ID ${keywordId} not found`)
    }

    try {
      // Fetch news for this keyword
      const newsItems = await fetchNews(keyword.text)

      // Save the results
      KeywordService.saveKeywordResults(keyword.id, newsItems)
      return true
    } catch (error) {
      console.error(`Error fetching news for keyword "${keyword.text}":`, error)
      throw error
    }
  },

  getNextUpdateTime: (): Date => {
    // Calculate the next 12 AM IST
    const now = new Date()
    const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30

    // Convert current time to IST
    const istTime = new Date(now.getTime() + istOffset)

    // Set to next 12 AM IST
    const nextUpdate = new Date(istTime)
    nextUpdate.setUTCHours(18, 30, 0, 0) // 18:30 UTC = 12:00 AM IST

    // If it's already past 12 AM IST, add a day
    if (istTime > nextUpdate) {
      nextUpdate.setUTCDate(nextUpdate.getUTCDate() + 1)
    }

    return new Date(nextUpdate.getTime() - istOffset) // Convert back to local time
  },

  getTimeUntilNextUpdate: (): string => {
    const nextUpdate = UpdateService.getNextUpdateTime()
    const now = new Date()

    const diffMs = nextUpdate.getTime() - now.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${diffHrs}h ${diffMins}m`
  },
}
