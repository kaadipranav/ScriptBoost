"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react"

export function HeroSection() {
  return (
    <section className="container relative">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Script Generation</span>
        </div>
        
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
          Generate Viral Scripts in{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Seconds
          </span>
        </h1>
        
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          Create engaging, platform-optimized scripts for TikTok, Instagram Reels, and YouTube Shorts. 
          From hook to CTA, our AI crafts viral-ready content tailored to your audience.
        </p>
        
        <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
          <Button size="lg" className="h-12 px-8" asChild>
            <Link href="#generator">
              Start Creating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8" asChild>
            <Link href="#features">Watch Demo</Link>
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid w-full max-w-md grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">10K+</div>
            <div className="text-sm text-muted-foreground">Scripts Generated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">3</div>
            <div className="text-sm text-muted-foreground">Platforms</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">5s</div>
            <div className="text-sm text-muted-foreground">Average Time</div>
          </div>
        </div>
      </div>
      
      {/* Features Preview */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col items-center space-y-2 border border-border/40 rounded-lg p-6 bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold">Lightning Fast</h3>
          <p className="text-center text-sm text-muted-foreground">
            Generate viral-ready scripts in seconds, not hours
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-2 border border-border/40 rounded-lg p-6 bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
            <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold">Platform Optimized</h3>
          <p className="text-center text-sm text-muted-foreground">
            Tailored for TikTok, Instagram Reels, and YouTube Shorts
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-2 border border-border/40 rounded-lg p-6 bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold">High Converting</h3>
          <p className="text-center text-sm text-muted-foreground">
            Strong hooks, engaging content, and clear CTAs
          </p>
        </div>
      </div>
    </section>
  )
}
