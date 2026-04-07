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
    <div className="flex flex-nowrap items-center justify-center whitespace-nowrap text-xs font-medium text-slate-400 md:text-base">
      {routes.map((route, index) => {
        const last = index === routes.length - 1
        const secondToLast = index === routes.length - 2
        const shouldHideLast = routes.length > 3

        // 4단계 이상일 때만 마지막 항목을 모바일에서 숨김
        const hiddenOnMobile =
          last && shouldHideLast ? "hidden md:contents" : ""
        // 4단계 이상: 직전 항목의 chevron은 완전히 숨김 (마지막 항목이 자체 chevron을 가짐)
        const chevronHidden = secondToLast && shouldHideLast ? "hidden" : ""

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
          <span
            key={index}
            className={`inline-flex items-center gap-x-0.5 md:gap-x-1.5 ${hiddenOnMobile}`}
          >
            {last && shouldHideLast && (
              <ChevronRight size={20} strokeWidth={1.67} />
            )}
            {routeContent}
            {!last && (
              <ChevronRight
                size={20}
                strokeWidth={1.67}
                className={chevronHidden}
              />
            )}
          </span>
        )
      })}
    </div>
  )
}

export default DefaultPageHeaderBreadCrumb
