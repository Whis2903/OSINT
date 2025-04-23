"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { KeywordService } from "@/lib/services/keyword-service"
import { UpdateService } from "@/lib/services/update-service"
import type { Keyword } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, Plus, RefreshCw, Trash2, Tag } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDistanceToNow } from "date-fns"

export default function KeywordManager() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [timeUntilUpdate, setTimeUntilUpdate] = useState("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Load keywords from storage
    const loadedKeywords = KeywordService.getKeywords()
    setKeywords(loadedKeywords)

    // Set up timer to update the countdown
    const timer = setInterval(() => {
      setTimeUntilUpdate(UpdateService.getTimeUntilNextUpdate())
    }, 60000) // Update every minute

    // Initial update
    setTimeUntilUpdate(UpdateService.getTimeUntilNextUpdate())

    return () => clearInterval(timer)
  }, [])

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newKeyword.trim()) {
      toast({
        title: "Error",
        description: "Keyword cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const keyword = KeywordService.addKeyword(newKeyword.trim())

      // Fetch initial results for this keyword
      await UpdateService.updateKeyword(keyword.id)

      setKeywords([...keywords, keyword])
      setNewKeyword("")
      toast({
        title: "Keyword added",
        description: `"${keyword.text}" has been added to your tracking list`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add keyword",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveKeyword = (id: string) => {
    try {
      const keyword = keywords.find((k) => k.id === id)
      if (!keyword) return

      KeywordService.removeKeyword(id)
      setKeywords(keywords.filter((k) => k.id !== id))
      toast({
        title: "Keyword removed",
        description: `"${keyword.text}" has been removed from your tracking list`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove keyword",
        variant: "destructive",
      })
    }
  }

  const handleUpdateKeyword = async (id: string) => {
    try {
      setIsUpdating(id)
      await UpdateService.updateKeyword(id)

      // Refresh the keywords list to get updated timestamps
      setKeywords(KeywordService.getKeywords())

      toast({
        title: "Keyword updated",
        description: "Latest news has been fetched for this keyword",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update keyword",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleUpdateAll = async () => {
    try {
      setIsLoading(true)
      const result = await UpdateService.updateAllKeywords()

      // Refresh the keywords list to get updated timestamps
      setKeywords(KeywordService.getKeywords())

      toast({
        title: "Keywords updated",
        description: `Updated ${result.success} keywords, ${result.failed} failed`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update keywords",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle server-side rendering
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>

          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-1" />
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}

          <div className="flex gap-2 pt-2">
            <div className="h-10 flex-grow bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Tracked Keywords
        </CardTitle>
        <CardDescription>Track news for these keywords. Updates daily at 12 AM IST.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            Next update in {timeUntilUpdate}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdateAll}
            disabled={isLoading || keywords.length === 0}
            className="flex items-center gap-1"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                Update All Now
              </>
            )}
          </Button>
        </div>

        {keywords.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No keywords</AlertTitle>
            <AlertDescription>Add keywords below to start tracking news.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {keywords.map((keyword) => (
              <div key={keyword.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div>
                  <div className="font-medium">{keyword.text}</div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {formatDistanceToNow(new Date(keyword.lastUpdated))} ago
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateKeyword(keyword.id)}
                    disabled={isUpdating === keyword.id}
                  >
                    <RefreshCw className={`h-4 w-4 ${isUpdating === keyword.id ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveKeyword(keyword.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddKeyword} className="flex gap-2 pt-2">
          <Input
            placeholder="Add a new keyword..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        Keywords are updated daily at 12 AM IST. You can also update them manually.
      </CardFooter>
    </Card>
  )
}
