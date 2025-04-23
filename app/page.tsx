import { Suspense } from "react"
import KeywordManager from "@/components/keyword-manager"
import NewsDashboard from "@/components/news-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Analytics } from "@/components/analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 inline-block">
            OSINT News Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Daily updates on your tracked keywords with sentiment and credibility analysis
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dashboard">News Dashboard</TabsTrigger>
            <TabsTrigger value="keywords">Keyword Manager</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Suspense fallback={<DashboardSkeleton />}>
              <NewsDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="keywords">
            <Suspense fallback={<KeywordManagerSkeleton />}>
              <KeywordManager />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      <Analytics />
    </main>
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

      {Array(3)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
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
          </Card>
        ))}
    </div>
  )
}

function KeywordManagerSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="p-6 space-y-4">
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
    </Card>
  )
}
