import { Suspense } from "react"
import KeywordManager from "@/components/keyword-manager"
import NewsDashboard from "@/components/news-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Analytics } from "@/components/analytics"
import MainLayout from "@/components/layout/main-layout"

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 inline-block">
            OSINT News Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Daily updates on your tracked keywords with sentiment and credibility analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Suspense fallback={<DashboardSkeleton />}>
              <NewsDashboard />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<KeywordManagerSkeleton />}>
              <KeywordManager />
            </Suspense>
          </div>
        </div>
      </div>

      <Analytics />
    </MainLayout>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-md" />
          ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-full" />
          ))}
      </div>

      <div className="h-[400px] rounded-xl bg-card shadow-sm animate-pulse" />
    </div>
  )
}

function KeywordManagerSkeleton() {
  return (
    <div className="p-6 border rounded-xl space-y-4 animate-pulse">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />

      <div className="flex justify-between items-center py-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>

      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}

      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 flex-grow" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}
