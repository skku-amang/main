import { Home } from "lucide-react"

import DefaultPageHeaderBreadCrumb from "@/components/PageHeaders/Default/BreadCrumb"
import { cn } from "@/lib/utils"

export type DefaultPageHeaderBreadCrumbRoute = {
  display: React.ReactNode
  href?: string
}

export const DefaultHomeIcon = () => {
  return <Home size={20} strokeWidth={1.67} />
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
    <div
      className={cn(
        "flex flex-col justify-center space-y-1 pb-2 pt-10 text-center md:space-y-5 md:pb-[91px] md:pt-[135px]",
        className
      )}
    >
      <h1 className="text-[22px] font-semibold md:text-5xl">{title}</h1>
      {routes.length > 0 && <DefaultPageHeaderBreadCrumb routes={routes} />}
    </div>
  )
}

export default DefaultPageHeader
