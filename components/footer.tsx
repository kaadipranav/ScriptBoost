import Link from "next/link"
import type { Route } from "next"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <Link
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              ScriptBoost Team
            </Link>
            . The source code is available on{" "}
            <Link
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href={"/privacy" as Route}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link
            href={"/terms" as Route}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <Link
            href={"/contact" as Route}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
