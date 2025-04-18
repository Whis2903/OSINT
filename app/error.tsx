"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

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
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground text-center mb-4 max-w-md">
        We encountered an error while processing your request. Please try again or contact support if the problem
        persists.
      </p>
      <Button onClick={reset} className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Try again
      </Button>
    </div>
  )
}
