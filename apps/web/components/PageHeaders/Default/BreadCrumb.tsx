"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

import { DefaultPageHeaderBreadCrumbRoute } from "@/components/PageHeaders/Default"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

function isLast(index: number, length: number) {
  return index === length - 1
}

interface DefaultPageHeaderBreadCrumbProps {
  routes: DefaultPageHeaderBreadCrumbRoute[]
}

const DefaultPageHeaderBreadCrumb = ({
  routes
}: DefaultPageHeaderBreadCrumbProps) => {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center gap-x-0.5 text-xs font-medium text-slate-400 md:gap-x-1.5 md:text-base">
      {routes.map((route, index) => {
        const last = isLast(index, routes.length)

        const item = (
          <React.Fragment key={index}>
            {route.dropdownItems ? (
              <Select
                value={route.href ?? ""}
                onValueChange={(value) => router.push(value)}
              >
                <SelectTrigger
                  className={`inline-flex h-auto w-auto items-center gap-1 border-none bg-transparent p-0 shadow-none ring-0 focus:ring-0 focus:ring-offset-0 ${
                    last ? "font-semibold text-primary" : "text-slate-400"
                  } [&>svg]:h-3 [&>svg]:w-3`}
                >
                  <SelectValue>{route.display}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {route.dropdownItems.map((item) => (
                    <SelectItem key={item.href} value={item.href}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : route.href ? (
              <span className={last ? "font-semibold text-primary" : ""}>
                <Link href={route.href}>{route.display}</Link>
              </span>
            ) : (
              <span className={last ? "font-semibold text-primary" : ""}>
                {route.display}
              </span>
            )}
            {!last && (
              <ChevronRight
                size={20}
                strokeWidth={1.67}
                className={
                  index === routes.length - 2 ? "hidden md:inline-block" : ""
                }
              />
            )}
          </React.Fragment>
        )

        if (last) {
          return (
            <span key={index} className="hidden md:contents">
              <ChevronRight size={20} strokeWidth={1.67} />
              {route.dropdownItems ? (
                <Select
                  value={route.href ?? ""}
                  onValueChange={(value) => router.push(value)}
                >
                  <SelectTrigger
                    className={`inline-flex h-auto w-auto items-center gap-1 border-none bg-transparent p-0 shadow-none ring-0 focus:ring-0 focus:ring-offset-0 font-semibold text-primary [&>svg]:h-3 [&>svg]:w-3`}
                  >
                    <SelectValue>{route.display}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {route.dropdownItems.map((item) => (
                      <SelectItem key={item.href} value={item.href}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="font-semibold text-primary">
                  {route.href ? (
                    <Link href={route.href}>{route.display}</Link>
                  ) : (
                    route.display
                  )}
                </span>
              )}
            </span>
          )
        }

        return item
      })}
    </div>
  )
}

export default DefaultPageHeaderBreadCrumb
