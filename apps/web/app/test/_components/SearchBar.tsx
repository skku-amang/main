import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface SearchBarProps {
  className?: string
}

export default function SearchBar({ className }: SearchBarProps) {
  return (
    <div className="relative">
      <Input
        placeholder="검색"
        className={cn(
          "w-80 h-10 placeholder:opacity-100 focus:placeholder:opacity-0 hover:cursor-pointer placeholder:transition-opacity placeholder:duration-500 focus-visible:ring-0 text-neutral-400 text-base font-normal leading-normal py-2 pl-[50px] hover:shadow-[0px_0px_0px_1px_rgba(104,113,130,0.36)] shadow-[0px_1px_2px_0px_rgba(64,63,84,0.10)] pr-[13px] rounded-[20px] border-gray-200 border-[1px]",
          className
        )}
      />
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 stroke-1 font-light"
        size={24}
      />
    </div>
  )
}
