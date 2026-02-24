"use client"

import {
  LayoutDashboard,
  Menu,
  Music,
  Users,
  Hash,
  Guitar,
  Mic
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ROUTES from "@/constants/routes"
import { cn } from "@/lib/utils"

import { useUnsavedChanges } from "./UnsavedChangesContext"

const NAV_ITEMS = [
  {
    href: ROUTES.ADMIN.INDEX,
    label: "대시보드",
    icon: LayoutDashboard,
    exact: true
  },
  { href: ROUTES.ADMIN.USERS, label: "회원", icon: Users },
  { href: ROUTES.ADMIN.GENERATIONS, label: "기수", icon: Hash },
  { href: ROUTES.ADMIN.PERFORMANCES, label: "공연", icon: Music },
  { href: ROUTES.ADMIN.TEAMS, label: "팀", icon: Mic },
  { href: ROUTES.ADMIN.SESSIONS, label: "세션", icon: Guitar }
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { guardNavigation } = useUnsavedChanges()

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => {
              if (guardNavigation(href)) {
                e.preventDefault()
                return
              }
              onNavigate?.()
            }}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)
  const { guardNavigation } = useUnsavedChanges()

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-neutral-200 bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-neutral-200 px-4 py-5">
            <Link
              href={ROUTES.ADMIN.INDEX}
              onClick={(e) => {
                if (guardNavigation(ROUTES.ADMIN.INDEX)) e.preventDefault()
              }}
              className="text-lg font-bold tracking-tight"
            >
              AMANG Admin
            </Link>
          </div>
          <div className="flex-1 px-3 py-4">
            <NavLinks />
          </div>
          <div className="border-t border-neutral-200 px-3 py-4">
            <Link
              href={ROUTES.HOME}
              onClick={(e) => {
                if (guardNavigation(ROUTES.HOME)) e.preventDefault()
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              사이트로 돌아가기
            </Link>
          </div>
        </div>
      </aside>

      {/* 모바일 햄버거 */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <div className="flex h-full flex-col">
              <div className="border-b border-neutral-200 px-4 py-5">
                <span className="text-lg font-bold tracking-tight">
                  AMANG Admin
                </span>
              </div>
              <div className="flex-1 px-3 py-4">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
