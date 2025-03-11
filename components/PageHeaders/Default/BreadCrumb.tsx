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
    <div className="flex items-center justify-center gap-x-1.5 font-medium text-slate-400">
      {routes.map((route, index) => (
        <React.Fragment key={route.href}>
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
