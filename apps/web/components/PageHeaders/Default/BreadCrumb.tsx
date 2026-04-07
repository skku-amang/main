"use client"

import { ChevronRight } from "lucide-react"
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

interface DefaultPageHeaderBreadCrumbProps {
  routes: DefaultPageHeaderBreadCrumbRoute[]
}

const DefaultPageHeaderBreadCrumb = ({
  routes
}: DefaultPageHeaderBreadCrumbProps) => {
  const router = useRouter()

  return (
    <div className="flex flex-nowrap items-center justify-center gap-x-0.5 whitespace-nowrap text-xs font-medium text-slate-400 md:gap-x-1.5 md:text-base">
      {routes.map((route, index) => {
        const last = index === routes.length - 1
        const secondToLast = index === routes.length - 2
        const shouldHideLast = routes.length > 3

        // 4단계 이상일 때만 마지막 항목을 모바일에서 숨김
        const hiddenOnMobile =
          last && shouldHideLast ? "hidden md:contents" : ""
        // 마지막 직전 chevron도 모바일에서 숨김
        const chevronHiddenOnMobile =
          secondToLast && shouldHideLast ? "hidden md:inline-block" : ""

        const routeContent = route.dropdownItems ? (
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
        )

        return (
          <span key={index} className={hiddenOnMobile}>
            {last && <ChevronRight size={20} strokeWidth={1.67} />}
            {routeContent}
            {!last && (
              <ChevronRight
                size={20}
                strokeWidth={1.67}
                className={chevronHiddenOnMobile}
              />
            )}
          </span>
        )
      })}
    </div>
  )
}

export default DefaultPageHeaderBreadCrumb
