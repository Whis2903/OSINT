"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "./search-params-provider"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewsSearch() {
  const router = useRouter()
  const { searchParams } = useSearchParams()

  const [query, setQuery] = useState(searchParams.query?.toString() || "")
  const [source, setSource] = useState(searchParams.source?.toString() || "all")
  const [sentiment, setSentiment] = useState(searchParams.sentiment?.toString() || "all")
  const [credibility, setCredibility] = useState(searchParams.credibility?.toString() || "all")
  const [hasResults, setHasResults] = useState(false)

  // Check if we have results based on URL parameters
  useEffect(() => {
    setHasResults(!!searchParams.query)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (query) params.set("query", query)
    // Only include filters if we have results
    if (hasResults) {
      if (source !== "all") params.set("source", source)
      if (sentiment !== "all") params.set("sentiment", sentiment)
      if (credibility !== "all") params.set("credibility", credibility)
    }

    router.push(`/?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search News</CardTitle>
        <CardDescription>Search for news across Google, Reddit, and YouTube</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for news..."
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </div>

          {hasResults && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Filter className="h-4 w-4" /> Source
                </label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sources</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Filter className="h-4 w-4" /> Sentiment
                </label>
                <Select value={sentiment} onValueChange={setSentiment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sentiment</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Filter className="h-4 w-4" /> Credibility
                </label>
                <Select value={credibility} onValueChange={setCredibility}>
                  <SelectTrigger>
                    <SelectValue placeholder="All credibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All credibility</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
