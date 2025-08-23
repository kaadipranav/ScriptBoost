"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function MyScriptsError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("My Scripts route error:", error)
  }, [error])

  return (
    <div className="container mx-auto max-w-2xl py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold">Couldn’t load your scripts</h1>
      <p className="text-sm text-muted-foreground">Please try again. If the error persists, refresh the page.</p>
      <div className="flex justify-center">
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  )
}
