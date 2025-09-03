"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl">
              Script<span className="text-primary">Boost</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="#features"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
          <span className="font-bold text-lg">
            Script<span className="text-primary">Boost</span>
          </span>
        </Link>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other content can go here */}
          </div>
          <nav className="flex items-center gap-2 pr-1 md:pr-0">
            {/* Temporarily disable Sign In to avoid 404 */}
            {/* <Button variant="ghost" size="sm">Sign In</Button> */}
            <ThemeToggle />
            <Button size="sm" asChild>
              <Link href="#generator">Get Started</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
