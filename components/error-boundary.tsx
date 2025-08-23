"use client"

import React from "react"
import { Button } from "./ui/button"

type Props = {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
  resetKeys?: React.DependencyList
}

type State = { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Optionally report to monitoring service
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  componentDidUpdate(prevProps: Props): void {
    const { resetKeys } = this.props
    if (!this.state.hasError) return
    if (!resetKeys || !prevProps.resetKeys) return
    const changed = resetKeys.some((key, i) => !Object.is(key, prevProps.resetKeys![i]))
    if (changed) this.reset()
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>
      return (
        <div className="p-6 border rounded-xl bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100">
          <h2 className="text-lg font-semibold mb-2">Something went wrong, try again.</h2>
          <p className="text-sm opacity-80 mb-4">An unexpected error occurred while rendering this section.</p>
          <Button variant="outline" onClick={this.reset}>Try again</Button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
