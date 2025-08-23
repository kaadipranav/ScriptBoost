import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative rounded-md group transition-all">
        <select
          className={cn(
            // base
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            // interactions
            "transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0",
            // sheen overlay via wrapper pseudo element
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-60 pointer-events-none transition-opacity duration-200 group-hover:opacity-90" />
        {/* sheen */}
        <span className="pointer-events-none absolute inset-0 rounded-md bg-white/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
