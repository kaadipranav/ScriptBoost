"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function RootError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  return (
    <div className="container mx-auto max-w-2xl py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">An unexpected error occurred. You can try again.</p>
      <div className="flex justify-center">
        <Button onClick={() => reset()}>Try again</Button>
      </div>
      {error?.digest && (
        <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
      )}
    </div>
  )
}
