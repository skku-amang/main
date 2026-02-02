import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronRight, Home } from "lucide-react"

type BreadcumbSize = "xs" | "sm" | "md" | "lg"

type BreadcumbItem = {
  label: string
  href?: string
}

interface BreadcumbProps {
  className?: string
  size?: BreadcumbSize
  items: BreadcumbItem[]
  homeHref?: string
  showHome?: boolean
}

const SIZE_STYLES: Record<
  BreadcumbSize,
  {
    icon: string
    chevron: string
    text: string
    gap: string
    itemGap: string
  }
> = {
  xs: {
    icon: "h-3.5 w-3.5",
    chevron: "h-3.5 w-3.5",
    text: "text-sm",
    gap: "gap-1.5",
    itemGap: "mx-1.5"
  },
  sm: {
    icon: "h-4 w-4",
    chevron: "h-4 w-4",
    text: "text-sm",
    gap: "gap-2",
    itemGap: "mx-2"
  },
  md: {
    icon: "h-5 w-5",
    chevron: "h-5 w-5",
    text: "text-base",
    gap: "gap-2.5",
    itemGap: "mx-2.5"
  },
  lg: {
    icon: "h-6 w-6",
    chevron: "h-6 w-6",
    text: "text-lg",
    gap: "gap-3",
    itemGap: "mx-3"
  }
}

export default function Breadcumb({
  className,
  size = "md",
  items,
  homeHref = "/",
  showHome = true
}: BreadcumbProps) {
  const s = SIZE_STYLES[size]

  const allItems: BreadcumbItem[] = showHome
    ? [{ label: "Home", href: homeHref }, ...items]
    : items

  return (
    <nav aria-label="Breadcrumb" className={cn("w-full", className)}>
      <ol className={cn("flex items-center", s.gap)}>
        {allItems.map((item, idx) => {
          const isLast = idx === allItems.length - 1

          return (
            <li key={`${item.label}-${idx}`} className="flex items-center">
              {/* HOME */}
              {idx === 0 && showHome ? (
                item.href ? (
                  <Link
                    href={item.href}
                    aria-label="Home"
                    className="text-slate-400 hover:text-slate-500"
                  >
                    <Home className={s.icon} />
                  </Link>
                ) : (
                  <Home className={cn(s.icon, "text-slate-400")} />
                )
              ) : isLast ? (
                /* 현재 페이지 */
                <span
                  className={cn(
                    "font-semibold whitespace-nowrap",
                    s.text,
                    "text-primary"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                /* 이전 경로 */
                <Link
                  href={item.href ?? "#"}
                  className={cn(
                    "whitespace-nowrap font-medium text-slate-400 hover:text-slate-500",
                    s.text
                  )}
                >
                  {item.label}
                </Link>
              )}

              {!isLast && (
                <ChevronRight
                  className={cn("text-slate-300", s.chevron, s.itemGap)}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
