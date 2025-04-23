"use client"

import { useState, useEffect } from "react"
import { KeywordService } from "@/lib/services/keyword-service"
import type { KeywordResults, NewsItem } from "@/lib/types"
import NewsCard from "@/components/news-card"
import NewsSummary from "@/components/news-summary"
import NewsAnalytics from "@/components/news-analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, BarChart3, Newspaper } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function NewsDashboard() {
  const [keywordResults, setKeywordResults] = useState<KeywordResults[]>([])
  const [selectedKeyword, setSelectedKeyword] = useState<string>("all")
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState<"news" | "analytics">("news")

  useEffect(() => {
    setIsClient(true)
    // Load keyword results from storage
    const results = KeywordService.getKeywordResults()
    setKeywordResults(results)

    // Set filtered news based on selected keyword
    if (selectedKeyword === "all") {
      setFilteredNews(KeywordService.getAllNewsItems())
    } else {
      const keywordResult = results.find((r) => r.keyword.id === selectedKeyword)
      setFilteredNews(keywordResult?.results || [])
    }
  }, [selectedKeyword])

  // Handle server-side rendering
  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-auto-fit gap-2 mb-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
        </div>

        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="p-6 border rounded-xl bg-card shadow-sm animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-24 w-24 rounded-md flex-shrink-0 bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1">
                  <div className="h-6 w-3/4 mb-2 bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-full mb-2 bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-full mb-2 bg-gray-200 dark:bg-gray-800" />
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="h-8 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    )
  }

  // If no keywords or results, show a message
  if (keywordResults.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No news yet</AlertTitle>
        <AlertDescription>Add keywords in the Keyword Manager to start tracking news.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "news" | "analytics")}>
        <TabsList className="mb-4">
          <TabsTrigger value="news" className="flex items-center gap-1">
            <Newspaper className="h-4 w-4" />
            News Feed
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-6">
          <NewsSummary />

          <Tabs defaultValue="all" value={selectedKeyword} onValueChange={setSelectedKeyword} className="w-full">
            <TabsList className="grid grid-cols-auto-fit gap-2 mb-4 h-auto p-1">
              <TabsTrigger value="all" className="rounded-full">
                All News
              </TabsTrigger>
              {keywordResults.map((result) => (
                <TabsTrigger key={result.keyword.id} value={result.keyword.id} className="rounded-full">
                  {result.keyword.text}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-2">
              {filteredNews.length > 0 ? (
                filteredNews.map((item) => <NewsCard key={item.id} item={item} />)
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No news found</AlertTitle>
                  <AlertDescription>No news items found for your tracked keywords.</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {keywordResults.map((result) => (
              <TabsContent key={result.keyword.id} value={result.keyword.id} className="space-y-4 mt-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Last updated: {formatDistanceToNow(new Date(result.lastUpdated))} ago
                </div>

                {result.results.length > 0 ? (
                  result.results.map((item) => <NewsCard key={item.id} item={item} />)
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No news found</AlertTitle>
                    <AlertDescription>No news items found for keyword "{result.keyword.text}".</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="analytics">
          <NewsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
