import { Suspense } from "react"
import { fetchNews } from "@/lib/fetch-news"
import NewsCard from "@/components/news-card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToCsv } from "@/lib/export-to-csv"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchParams {
  query?: string
  source?: string
  sentiment?: string
  credibility?: string
}

export default async function NewsResults({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Safely extract search parameters with proper type checking
  const { query = "", source = "all", sentiment = "all", credibility = "all" } = searchParams

  if (!query) {
    return <div className="mt-8 text-center text-muted-foreground">Enter a search query to find news</div>
  }

  try {
    const newsResults = await fetchNews(query, source, sentiment, credibility)

    if (newsResults.length === 0) {
      return (
        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No results found</AlertTitle>
          <AlertDescription>Try adjusting your search query or filters</AlertDescription>
        </Alert>
      )
    }

    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Results</h2>
          <form action={async (formData: FormData) => {
            'use server'
            await exportToCsv(formData)
          }}>
            <input type="hidden" name="query" value={query} />
            <input type="hidden" name="source" value={source} />
            <input type="hidden" name="sentiment" value={sentiment} />
            <input type="hidden" name="credibility" value={credibility} />
            <Button type="submit" className="outline">
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </form>
        </div>

        <div className="grid gap-4">
          {newsResults.map((item) => (
            <Suspense key={item.id} fallback={<NewsCardSkeleton />}>
              <NewsCard item={item} />
            </Suspense>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error instanceof Error ? error.message : "Failed to fetch news results"}</AlertDescription>
      </Alert>
    )
  }
}

function NewsCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}
