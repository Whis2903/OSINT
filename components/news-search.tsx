"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "./search-params-provider"
import { Search, Filter, X, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

export default function NewsSearch() {
  const router = useRouter()
  const { searchParams } = useSearchParams()

  const [query, setQuery] = useState(searchParams.query?.toString() || "")
  const [source, setSource] = useState(searchParams.source?.toString() || "all")
  const [sentiment, setSentiment] = useState(searchParams.sentiment?.toString() || "all")
  const [credibility, setCredibility] = useState(searchParams.credibility?.toString() || "all")
  const [isFiltersVisible, setIsFiltersVisible] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Update active filters when filters change
  useEffect(() => {
    const filters = []
    if (source !== "all") filters.push(`Source: ${source}`)
    if (sentiment !== "all") filters.push(`Sentiment: ${sentiment}`)
    if (credibility !== "all") filters.push(`Credibility: ${credibility}`)
    setActiveFilters(filters)
  }, [source, sentiment, credibility])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (source !== "all") params.set("source", source)
    if (sentiment !== "all") params.set("sentiment", sentiment)
    if (credibility !== "all") params.set("credibility", credibility)

    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
    setSource("all")
    setSentiment("all")
    setCredibility("all")
  }

  const removeFilter = (filter: string) => {
    if (filter.startsWith("Source:")) setSource("all")
    if (filter.startsWith("Sentiment:")) setSentiment("all")
    if (filter.startsWith("Credibility:")) setCredibility("all")
  }

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardContent className="p-0">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for news..."
                className="pl-10 pr-4 py-6 border-0 shadow-sm focus-visible:ring-purple-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 ml-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-sm"
                    onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                  >
                    <Sliders className="h-4 w-4" />
                    {activeFilters.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {activeFilters.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Filter news by source, sentiment, and credibility</SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Filter className="h-4 w-4" /> Source
                      </label>
                      <Select value={source} onValueChange={setSource}>
                        <SelectTrigger className="w-full">
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Filter className="h-4 w-4" /> Sentiment
                      </label>
                      <Select value={sentiment} onValueChange={setSentiment}>
                        <SelectTrigger className="w-full">
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Filter className="h-4 w-4" /> Credibility
                      </label>
                      <Select value={credibility} onValueChange={setCredibility}>
                        <SelectTrigger className="w-full">
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

                    {activeFilters.length > 0 && (
                      <Button variant="outline" className="w-full" onClick={clearFilters}>
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              <Button
                type="submit"
                className="h-10 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
              >
                Search
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {activeFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4 flex flex-wrap gap-2"
              >
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="px-3 py-1 rounded-full flex items-center gap-1">
                    {filter}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 rounded-full"
                      onClick={() => removeFilter(filter)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {activeFilters.length > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2 ml-1" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </CardContent>
    </Card>
  )
}
