import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

type SearchBarSize = "xs" | "sm" | "md" | "lg"

interface SearchBarProps {
  className?: string
  size?: SearchBarSize
  placeholder?: string
}

const SIZE_STYLES: Record<
  SearchBarSize,
  {
    input: string
    iconSize: number
    iconLeft: string
  }
> = {
  xs: {
    // compact
    input: "h-8 text-sm pl-10 rounded-full",
    iconSize: 18,
    iconLeft: "left-3"
  },
  sm: {
    input: "h-9 text-sm pl-11 rounded-full",
    iconSize: 20,
    iconLeft: "left-3.5"
  },
  md: {
    // your original-ish baseline (but without width hardcoding)
    input: "h-10 text-base pl-12 rounded-full",
    iconSize: 22,
    iconLeft: "left-4"
  },
  lg: {
    input: "h-12 text-base pl-14 rounded-full",
    iconSize: 24,
    iconLeft: "left-5"
  }
}

export default function SearchBar({
  className,
  size = "md",
  placeholder = "검색"
}: SearchBarProps) {
  const s = SIZE_STYLES[size]

  return (
    <div className="relative w-full">
      <Input
        placeholder={placeholder}
        className={cn(
          "placeholder:opacity-100 focus:placeholder:opacity-0 hover:cursor-pointer placeholder:transition-opacity placeholder:duration-500 focus-visible:ring-0 text-neutral-400 font-normal leading-normal py-2 pr-3 hover:shadow-none hover:border-gray-300 shadow-[0px_1px_2px_0px_rgba(64,63,84,0.10)] border-gray-200 border",
          s.input,
          className
        )}
      />
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-gray-500 stroke-1 font-light pointer-events-none",
          s.iconLeft
        )}
        size={s.iconSize}
      />
    </div>
  )
}
