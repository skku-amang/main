import { SearchIcon, XIcon } from "lucide-react"
import React from "react"

import { cn } from "@/lib/utils"

const Search = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, onChange, ...props }, ref) => {
  const [value, setValue] = React.useState((props.defaultValue as string) ?? "")
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onChange?.(e)
  }

  const handleClear = () => {
    setValue("")
    const input = inputRef.current
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set
      nativeInputValueSetter?.call(input, "")
      input.dispatchEvent(new Event("input", { bubbles: true }))
      input.focus()
    }
  }

  return (
    <div
      className={cn(
        "flex h-10 w-full items-center gap-x-2.5 rounded-[20px] border border-gray-200 bg-white px-[13px] py-2 text-sm ring-offset-background drop-shadow-[0_1px_2px_rgb(64,63,84,0.1)] transition duration-300 focus-within:ring-0 focus-within:ring-offset-0 focus-within:drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] md:w-80",
        className
      )}
    >
      <SearchIcon size={24} className="text-gray-500" strokeWidth={1.25} />
      <input
        {...props}
        placeholder="검색"
        type="text"
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        value={value}
        onChange={handleChange}
        className="w-full placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        style={{ caretColor: "#111827" }}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          aria-label="검색어 지우기"
        >
          <XIcon size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  )
})

Search.displayName = "Search"

export default Search
