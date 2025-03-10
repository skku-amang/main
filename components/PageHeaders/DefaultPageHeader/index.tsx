import { cn } from "@/lib/utils"

import DefaultPageHeaderBreadCrumb from "./BreadCrumb"

export type DefaultPageHeaderBreadCrumbRoute = {
  display: React.ReactNode
  href: string
}

interface DefaultPageHeaderProps {
  title: React.ReactNode
  routes?: DefaultPageHeaderBreadCrumbRoute[]
  className?: string
}

const DefaultPageHeader = ({
  title,
  routes = [],
  className
}: DefaultPageHeaderProps) => {
  return (
    <div className={cn("flex flex-col justify-center space-y-5", className)}>
      <h1 className="text-5xl font-semibold text-gray-800">{title}</h1>
      {routes.length > 0 && <DefaultPageHeaderBreadCrumb routes={routes} />}
    </div>
  )
}

export default DefaultPageHeader
