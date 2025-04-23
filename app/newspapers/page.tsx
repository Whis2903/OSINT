"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { fetchNewspapers, fetchNewspaperByDate, PAKISTANI_NEWSPAPERS } from "@/lib/sources/newspapers"
import { Newspaper, CalendarDays, RefreshCw, Search } from "lucide-react"
import MainLayout from "@/components/layout/main-layout"
import type { NewsItem } from "@/lib/types"
import NewsCard from "@/components/news-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function NewspapersPage() {
  const [activeTab, setActiveTab] = useState<"today" | "archive">("today")
  const [selectedDate, setSelectedDate] = useState<Date>(subDays(new Date(), 1))
  const [todayNews, setTodayNews] = useState<NewsItem[]>([])
  const [archiveNews, setArchiveNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterText, setFilterText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Get unique categories from newspapers
  const categories = Array.from(new Set(["all", ...PAKISTANI_NEWSPAPERS.map((paper) => paper.category)]))

  useEffect(() => {
    loadTodayNews()
  }, [])

  useEffect(() => {
    if (activeTab === "archive") {
      loadArchiveNews()
    }
  }, [selectedDate, activeTab])

  async function loadTodayNews() {
    try {
      setLoading(true)
      const news = await fetchNewspapers()
      setTodayNews(news)
    } catch (error) {
      console.error("Failed to load today's newspapers:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadArchiveNews() {
    try {
      setLoading(true)
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      const news = await fetchNewspaperByDate(formattedDate)
      setArchiveNews(news)
    } catch (error) {
      console.error("Failed to load archived newspapers:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true)
      if (activeTab === "today") {
        await loadTodayNews()
      } else {
        await loadArchiveNews()
      }
    } finally {
      setRefreshing(false)
    }
  }

  function filterNewspapers(news: NewsItem[]): NewsItem[] {
    return news.filter((item) => {
      // Filter by category
      const categoryMatch = selectedCategory === "all" || item.category === selectedCategory

      // Filter by search text
      const searchText = filterText.toLowerCase()
      const textMatch =
        !searchText ||
        item.title.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText) ||
        (item.newspaper && item.newspaper.toLowerCase().includes(searchText))

      return categoryMatch && textMatch
    })
  }

  const filteredTodayNews = filterNewspapers(todayNews)
  const filteredArchiveNews = filterNewspapers(archiveNews)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pakistani Newspapers</h1>
            <p className="text-muted-foreground">Browse the latest headlines from major Pakistani newspapers</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="w-full md:w-auto">
            {refreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "today" | "archive")}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                Today's Headlines
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Archived Headlines
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {activeTab === "archive" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {format(selectedDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
              <div className="relative w-full md:w-[200px]">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter headlines..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => <NewsCardSkeleton key={i} />)
              ) : filteredTodayNews.length > 0 ? (
                filteredTodayNews.map((item) => <NewsCard key={item.id} item={item} />)
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p>No headlines found matching your filters.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="archive" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => <NewsCardSkeleton key={i} />)
              ) : filteredArchiveNews.length > 0 ? (
                filteredArchiveNews.map((item) => <NewsCard key={item.id} item={item} />)
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p>No archived headlines found for {format(selectedDate, "PPP")}.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

function NewsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-24 w-24 rounded-md flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
