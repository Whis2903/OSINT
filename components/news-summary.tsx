"use client"

import { useState, useEffect } from "react"
import { KeywordService } from "@/lib/services/keyword-service"
import type { NewsItem } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, Meh, Shield, ShieldAlert, ShieldQuestion } from "lucide-react"

export default function NewsSummary() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Load all news items
    const items = KeywordService.getAllNewsItems()
    setNewsItems(items)
  }, [])

  // Handle server-side rendering
  if (!isClient) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  // Calculate metrics
  const totalItems = newsItems.length
  const positiveSentiment = newsItems.filter((item) => item.sentiment === "positive").length
  const neutralSentiment = newsItems.filter((item) => item.sentiment === "neutral").length
  const negativeSentiment = newsItems.filter((item) => item.sentiment === "negative").length
  const highCredibility = newsItems.filter((item) => item.credibility === "high").length
  const mediumCredibility = newsItems.filter((item) => item.credibility === "medium").length
  const lowCredibility = newsItems.filter((item) => item.credibility === "low").length

  // Calculate percentages
  const positivePercent = totalItems ? Math.round((positiveSentiment / totalItems) * 100) : 0
  const neutralPercent = totalItems ? Math.round((neutralSentiment / totalItems) * 100) : 0
  const negativePercent = totalItems ? Math.round((negativeSentiment / totalItems) * 100) : 0
  const highCredPercent = totalItems ? Math.round((highCredibility / totalItems) * 100) : 0
  const mediumCredPercent = totalItems ? Math.round((mediumCredibility / totalItems) * 100) : 0
  const lowCredPercent = totalItems ? Math.round((lowCredibility / totalItems) * 100) : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
            Positive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{positivePercent}%</div>
          <p className="text-xs text-muted-foreground">{positiveSentiment} items</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Meh className="h-4 w-4 mr-1 text-yellow-500" />
            Neutral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{neutralPercent}%</div>
          <p className="text-xs text-muted-foreground">{neutralSentiment} items</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <ThumbsDown className="h-4 w-4 mr-1 text-red-500" />
            Negative
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{negativePercent}%</div>
          <p className="text-xs text-muted-foreground">{negativeSentiment} items</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Shield className="h-4 w-4 mr-1 text-blue-500" />
            High Cred.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{highCredPercent}%</div>
          <p className="text-xs text-muted-foreground">{highCredibility} items</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <ShieldQuestion className="h-4 w-4 mr-1 text-violet-500" />
            Medium Cred.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mediumCredPercent}%</div>
          <p className="text-xs text-muted-foreground">{mediumCredibility} items</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <ShieldAlert className="h-4 w-4 mr-1 text-pink-500" />
            Low Cred.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowCredPercent}%</div>
          <p className="text-xs text-muted-foreground">{lowCredibility} items</p>
        </CardContent>
      </Card>
    </div>
  )
}
