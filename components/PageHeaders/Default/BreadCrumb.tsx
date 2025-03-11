import { ChevronRight } from "lucide-react"
import Link from "next/link"
import React from "react"

import { DefaultPageHeaderBreadCrumbRoute } from "@/components/PageHeaders/Default"

interface DefaultPageHeaderBreadCrumbProps {
  routes: DefaultPageHeaderBreadCrumbRoute[]
}

const DefaultPageHeaderBreadCrumb = ({
  routes
}: DefaultPageHeaderBreadCrumbProps) => {
  return (
    <div className="flex items-center justify-center gap-x-1.5 text-slate-400">
      {routes.map((route) => (
        <React.Fragment key={route.href}>
          <Link href={route.href}>{route.display}</Link>
          {routes.indexOf(route) !== routes.length - 1 && (
            <ChevronRight size={20} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default DefaultPageHeaderBreadCrumb
