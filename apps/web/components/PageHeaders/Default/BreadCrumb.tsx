import { ChevronRight } from "lucide-react"
import Link from "next/link"
import React from "react"

import { DefaultPageHeaderBreadCrumbRoute } from "@/components/PageHeaders/Default"

function isLast(index: number, length: number) {
  return index === length - 1
}

interface DefaultPageHeaderBreadCrumbProps {
  routes: DefaultPageHeaderBreadCrumbRoute[]
}

const DefaultPageHeaderBreadCrumb = ({
  routes
}: DefaultPageHeaderBreadCrumbProps) => {
  return (
    <div className="flex items-center justify-center gap-x-0.5 text-xs font-medium text-slate-400 md:gap-x-1.5 md:text-base">
      {routes.map((route, index) => (
        <React.Fragment key={index}>
          {route.href ? (
            <span
              className={
                isLast(index, routes.length) ? "font-semibold text-primary" : ""
              }
            >
              <Link href={route.href}>{route.display}</Link>
            </span>
          ) : (
            <span
              className={
                isLast(index, routes.length) ? "font-semibold text-primary" : ""
              }
            >
              {route.display}
            </span>
          )}
          {routes.indexOf(route) !== routes.length - 1 && (
            <ChevronRight size={20} strokeWidth={1.67} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default DefaultPageHeaderBreadCrumb
