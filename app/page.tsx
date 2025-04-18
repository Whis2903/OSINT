import { Suspense } from "react"
import NewsSearch from "@/components/news-search"
import NewsResults from "@/components/news-results"
import { SearchParamsProvider } from "@/components/search-params-provider"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2">OSINT News Analyzer</h1>
        <p className="text-center text-muted-foreground mb-8">
          Analyze news from Google, Reddit, and YouTube with sentiment and credibility detection
        </p>

        <SearchParamsProvider searchParams={searchParams}>
          <NewsSearch />

          <Suspense fallback={<SearchResultsSkeleton />}>
            <NewsResults searchParams={searchParams} />
          </Suspense>
        </SearchParamsProvider>
      </div>
    </main>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="mt-8 grid gap-4">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="p-4 border rounded-lg bg-card">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
    </div>
  )
}
