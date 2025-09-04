"use client"
import React from 'react'

export function GeneratorFormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-24 w-full bg-muted rounded" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-28 bg-muted rounded" />
        <div className="h-10 w-28 bg-muted rounded" />
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="h-6 w-80 bg-muted rounded" />
      <div className="h-96 w-full bg-muted rounded" />
    </div>
  )
}
