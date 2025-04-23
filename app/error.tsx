"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6 animate-pulse">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        We encountered an error while processing your request. Please try again or return to the home page.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="default" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go home
          </Button>
        </Link>
      </div>
      {error.digest && <p className="mt-4 text-xs text-muted-foreground">Error ID: {error.digest}</p>}
    </div>
  )
}
