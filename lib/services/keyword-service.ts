"use client"

import type { Keyword, KeywordResults, NewsItem } from "../types"
import { PAKISTANI_NEWSPAPERS } from "../sources/newspapers"

// Polyfill for uuid if needed
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Safe localStorage access
const getLocalStorage = () => {
  if (typeof window !== "undefined") {
    return window.localStorage
  }
  return null
}

// In a real application, this would be a database or API call
// For this demo, we'll use localStorage
export const KeywordService = {
  getKeywords: (): Keyword[] => {
    const storage = getLocalStorage()
    if (!storage) return []

    const stored = storage.getItem("osint-keywords")
    if (!stored) {
      // Initialize default keywords if none exist, include news channels
      const defaultKeywords = KeywordService.getDefaultNewsChannels()
      storage.setItem("osint-keywords", JSON.stringify(defaultKeywords))
      return defaultKeywords
    }

    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error("Failed to parse keywords from localStorage", e)
      return []
    }
  },

  getDefaultNewsChannels: (): Keyword[] => {
    const now = new Date().toISOString()
    return PAKISTANI_NEWSPAPERS.map((paper) => ({
      id: `newspaper-${paper.id}`,
      text: paper.name,
      createdAt: now,
      lastUpdated: now,
      isNewsChannel: true,
      country: paper.country,
      language: paper.language,
      category: paper.category,
    }))
  },

  addKeyword: (text: string, isNewsChannel = false, details = {}): Keyword => {
    const storage = getLocalStorage()
    if (!storage) {
      throw new Error("Browser storage not available")
    }

    const keywords = KeywordService.getKeywords()

    // Check if keyword already exists
    if (keywords.some((k) => k.text.toLowerCase() === text.toLowerCase())) {
      throw new Error("Keyword already exists")
    }

    const now = new Date().toISOString()
    const newKeyword: Keyword = {
      id: generateId(),
      text,
      createdAt: now,
      lastUpdated: now,
      isNewsChannel,
      ...details,
    }

    const updatedKeywords = [...keywords, newKeyword]
    storage.setItem("osint-keywords", JSON.stringify(updatedKeywords))

    return newKeyword
  },

  removeKeyword: (id: string): void => {
    const storage = getLocalStorage()
    if (!storage) return

    const keywords = KeywordService.getKeywords()
    const updatedKeywords = keywords.filter((k) => k.id !== id)
    storage.setItem("osint-keywords", JSON.stringify(updatedKeywords))

    // Also remove results for this keyword
    KeywordService.removeKeywordResults(id)
  },

  getKeywordResults: (): KeywordResults[] => {
    const storage = getLocalStorage()
    if (!storage) return []

    const stored = storage.getItem("osint-keyword-results")
    if (!stored) return []

    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error("Failed to parse keyword results from localStorage", e)
      return []
    }
  },

  getKeywordResultById: (keywordId: string): KeywordResults | null => {
    const results = KeywordService.getKeywordResults()
    return results.find((r) => r.keyword.id === keywordId) || null
  },

  saveKeywordResults: (keywordId: string, newsItems: NewsItem[]): void => {
    const storage = getLocalStorage()
    if (!storage) return

    const allResults = KeywordService.getKeywordResults()
    const keywords = KeywordService.getKeywords()
    const keyword = keywords.find((k) => k.id === keywordId)

    if (!keyword) {
      console.error(`Keyword with ID ${keywordId} not found`)
      return
    }

    // Update the keyword's lastUpdated timestamp
    const updatedKeyword = {
      ...keyword,
      lastUpdated: new Date().toISOString(),
    }

    // Update keywords in localStorage
    const updatedKeywords = keywords.map((k) => (k.id === keywordId ? updatedKeyword : k))
    storage.setItem("osint-keywords", JSON.stringify(updatedKeywords))

    // Add keywordId to each news item
    const itemsWithKeywordId = newsItems.map((item) => ({
      ...item,
      keywordId,
    }))

    // Update or add the results for this keyword
    const existingResultIndex = allResults.findIndex((r) => r.keyword.id === keywordId)

    if (existingResultIndex >= 0) {
      allResults[existingResultIndex] = {
        keyword: updatedKeyword,
        results: itemsWithKeywordId,
        lastUpdated: new Date().toISOString(),
      }
    } else {
      allResults.push({
        keyword: updatedKeyword,
        results: itemsWithKeywordId,
        lastUpdated: new Date().toISOString(),
      })
    }

    storage.setItem("osint-keyword-results", JSON.stringify(allResults))
  },

  removeKeywordResults: (keywordId: string): void => {
    const storage = getLocalStorage()
    if (!storage) return

    const results = KeywordService.getKeywordResults()
    const updatedResults = results.filter((r) => r.keyword.id !== keywordId)
    storage.setItem("osint-keyword-results", JSON.stringify(updatedResults))
  },

  getAllNewsItems: (): NewsItem[] => {
    const results = KeywordService.getKeywordResults()
    return results.flatMap((r) => r.results)
  },
}
