"use client"

import { Suspense } from "react"
import { fetchNews } from "@/lib/fetch-news"
import NewsCard from "@/components/news-card"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle, RefreshCw } from "lucide-react"
import { exportToCsv } from "@/lib/export-to-csv"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function NewsResults({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const query = searchParams.query?.toString() || ""
  const source = searchParams.source?.toString() || "all"
  const sentiment = searchParams.sentiment?.toString() || "all"
  const credibility = searchParams.credibility?.toString() || "all"

  if (!query) {
    return (
      <div className="mt-8 text-center">
        <div className="inline-flex items-center justify-center p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl">
          <p className="text-lg text-muted-foreground">Enter a search query to find news</p>
        </div>
      </div>
    )
  }

  try {
    const newsResults = await fetchNews(query, source, sentiment, credibility)

    if (newsResults.length === 0) {
      return (
        <Alert className="mt-8 border-none shadow-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No results found</AlertTitle>
          <AlertDescription>Try adjusting your search query or filters</AlertDescription>
        </Alert>
      )
    }

    // Group results by source
    const googleResults = newsResults.filter((item) => item.source === "google")
    const redditResults = newsResults.filter((item) => item.source === "reddit")
    const youtubeResults = newsResults.filter((item) => item.source === "youtube")

    // Determine which tab to show by default
    let defaultTab = "all"
    if (source === "google") defaultTab = "google"
    if (source === "reddit") defaultTab = "reddit"
    if (source === "youtube") defaultTab = "youtube"

    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Results for "{query}"</h2>
          <form action={exportToCsv}>
            <input type="hidden" name="query" value={query} />
            <input type="hidden" name="source" value={source} />
            <input type="hidden" name="sentiment" value={sentiment} />
            <input type="hidden" name="credibility" value={credibility} />
            <Button type="submit" variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export to CSV
            </Button>
          </form>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all" className="rounded-full">
              All ({newsResults.length})
            </TabsTrigger>
            <TabsTrigger value="google" className="rounded-full">
              Google ({googleResults.length})
            </TabsTrigger>
            <TabsTrigger value="reddit" className="rounded-full">
              Reddit ({redditResults.length})
            </TabsTrigger>
            <TabsTrigger value="youtube" className="rounded-full">
              YouTube ({youtubeResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {newsResults.map((item) => (
              <Suspense key={item.id} fallback={<NewsCardSkeleton />}>
                <NewsCard item={item} />
              </Suspense>
            ))}
          </TabsContent>

          <TabsContent value="google" className="space-y-4">
            {googleResults.length > 0 ? (
              googleResults.map((item) => (
                <Suspense key={item.id} fallback={<NewsCardSkeleton />}>
                  <NewsCard item={item} />
                </Suspense>
              ))
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Google results</AlertTitle>
                <AlertDescription>Try adjusting your search query</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="reddit" className="space-y-4">
            {redditResults.length > 0 ? (
              redditResults.map((item) => (
                <Suspense key={item.id} fallback={<NewsCardSkeleton />}>
                  <NewsCard item={item} />
                </Suspense>
              ))
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Reddit results</AlertTitle>
                <AlertDescription>Try adjusting your search query</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4">
            {youtubeResults.length > 0 ? (
              youtubeResults.map((item) => (
                <Suspense key={item.id} fallback={<NewsCardSkeleton />}>
                  <NewsCard item={item} />
                </Suspense>
              ))
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No YouTube results</AlertTitle>
                <AlertDescription>Try adjusting your search query</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    return (
      <Alert variant="destructive" className="mt-8 border-none shadow-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error instanceof Error ? error.message : "Failed to fetch news results"}</p>
          <Button
            variant="outline"
            size="sm"
            className="self-start gap-2 mt-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
}

function NewsCardSkeleton() {
  return (
    <div className="p-6 border rounded-xl bg-card shadow-sm animate-pulse">
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
    </div>
  )
}
