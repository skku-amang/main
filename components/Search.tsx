import { SearchIcon } from "lucide-react"
import React from "react"

import { cn } from "@/lib/utils"

const Search = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex h-10 w-80 items-center gap-x-2.5 rounded-lg border border-gray-200 bg-white px-[13px] py-2 text-sm ring-offset-background drop-shadow-[0_1px_2px_rgb(64,63,84,0.1)] transition duration-300 focus-within:ring-0 focus-within:ring-offset-0 focus-within:drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      <SearchIcon size={24} className="text-gray-500" strokeWidth={1.25} />
      <input
        {...props}
        placeholder="검색"
        type="search"
        ref={ref}
        className="w-full placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        style={{ caretColor: "#111827" }}
      />
    </div>
  )
})

Search.displayName = "Search"

export default Search
