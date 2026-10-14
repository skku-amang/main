"use client"

import { Building2, Home, UserRound, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import ROUTES from "@/constants/routes"
import { useAuth } from "@/lib/providers/auth-provider"
import { cn } from "@/lib/utils"

type Tab = {
  label: string
  href: string
  icon: React.ElementType
  isCurrent: (pathname: string) => boolean
}

const BottomTabBar = () => {
  const pathname = usePathname()
  const { user } = useAuth()

  const tabs: Tab[] = [
    {
      label: "홈",
      href: ROUTES.HOME,
      icon: Home,
      isCurrent: (p) => p === ROUTES.HOME
    },
    {
      label: "팀 모집",
      href: ROUTES.PERFORMANCE.TEAM.LATEST_LIST,
      icon: Users,
      isCurrent: (p) => /^\/performances\/[^/]+\/teams/.test(p)
    },
    {
      label: "동방 예약",
      href: ROUTES.RESERVATION.CLUBROOM,
      icon: Building2,
      isCurrent: (p) => p.startsWith(ROUTES.RESERVATION.CLUBROOM)
    },
    {
      label: "내 정보",
      href: user ? ROUTES.PROFILE.INDEX : ROUTES.LOGIN,
      icon: UserRound,
      isCurrent: (p) =>
        p.startsWith(ROUTES.PROFILE.INDEX) ||
        p.startsWith(ROUTES.SUGGESTIONS) ||
        p.startsWith(ROUTES.LOGIN)
    }
  ]

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
    >
      <ul className="flex h-14">
        {tabs.map(({ label, href, icon: Icon, isCurrent }) => {
          const current = isCurrent(pathname)
          return (
            <li key={label} className="flex-1">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                  current ? "text-primary" : "text-slate-400"
                )}
              >
                <Icon className="size-5" strokeWidth={current ? 2.4 : 2} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomTabBar
