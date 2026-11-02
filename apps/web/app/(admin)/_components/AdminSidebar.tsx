"use client"

import {
  ArrowLeft,
  Calendar,
  LayoutDashboard,
  Menu,
  Music,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  UserCheck,
  Hash,
  Guitar,
  Mic,
  Package
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import ROUTES from "@/constants/routes"
import { usePendingUsers } from "@/hooks/api/useUser"
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
  { href: ROUTES.ADMIN.PENDING_USERS, label: "승인 대기", icon: UserCheck },
  { href: ROUTES.ADMIN.GENERATIONS, label: "기수", icon: Hash },
  { href: ROUTES.ADMIN.PERFORMANCES, label: "공연", icon: Music },
  { href: ROUTES.ADMIN.TEAMS, label: "팀", icon: Mic },
  { href: ROUTES.ADMIN.SESSIONS, label: "세션", icon: Guitar },
  { href: ROUTES.ADMIN.RENTALS, label: "예약", icon: Calendar },
  { href: ROUTES.ADMIN.EQUIPMENTS, label: "장비", icon: Package }
]

const COLLAPSED_KEY = "amang:admin-sidebar-collapsed"

/** 데스크톱 사이드바 접힘 여부. 서버 렌더와 어긋나지 않게 저장값은 마운트 후에 읽는다 */
function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1")
    } catch {
      // 저장소를 못 쓰면 펼친 채로
    }
  }, [])

  const toggle = () =>
    setCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, prev ? "0" : "1")
      } catch {
        // 저장 못 해도 이번 방문 동안은 유지
      }
      return !prev
    })

  return [collapsed, toggle] as const
}

function NavLinks({
  onNavigate,
  collapsed = false
}: {
  onNavigate?: () => void
  /** 아이콘만 보이는 접힌 사이드바 */
  collapsed?: boolean
}) {
  const pathname = usePathname()
  const { guardNavigation } = useUnsavedChanges()
  const { data: pendingUsers } = usePendingUsers()
  const counts: Partial<Record<string, number>> = {
    [ROUTES.ADMIN.PENDING_USERS]: pendingUsers?.length
  }

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href)
        const count = counts[href] ?? 0

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
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            )}
          >
            <span className="relative">
              <Icon className="h-4 w-4" />
              {collapsed && count > 0 && (
                <span
                  aria-hidden
                  className="absolute -right-2.5 -top-2 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </span>
            <span className={cn(collapsed && "sr-only")}>{label}</span>
            {count > 0 && (
              <>
                <span className="sr-only">{`${count}명`}</span>
                {!collapsed && (
                  <span
                    aria-hidden
                    className="ml-auto min-w-5 rounded-full bg-red-500 px-1.5 text-center text-xs font-bold leading-5 text-white"
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)
  const [collapsed, toggleCollapsed] = useSidebarCollapsed()
  const { guardNavigation } = useUnsavedChanges()

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside
        className={cn(
          "hidden flex-shrink-0 border-r border-neutral-200 bg-white transition-[width] md:block",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              "flex items-center border-b border-neutral-200 py-5",
              collapsed ? "justify-center px-2" : "justify-between px-4"
            )}
          >
            {!collapsed && (
              <Link
                href={ROUTES.ADMIN.INDEX}
                onClick={(e) => {
                  if (guardNavigation(ROUTES.ADMIN.INDEX)) e.preventDefault()
                }}
                className="text-lg font-bold tracking-tight"
              >
                AMANG Admin
              </Link>
            )}
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
              title={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
              className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className={cn("flex-1 py-4", collapsed ? "px-2" : "px-3")}>
            <NavLinks collapsed={collapsed} />
          </div>
          <div
            className={cn(
              "border-t border-neutral-200 py-4",
              collapsed ? "px-2" : "px-3"
            )}
          >
            <Link
              href={ROUTES.HOME}
              onClick={(e) => {
                if (guardNavigation(ROUTES.HOME)) e.preventDefault()
              }}
              title={collapsed ? "사이트로 돌아가기" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900",
                collapsed && "justify-center px-0"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className={cn(collapsed && "sr-only")}>
                사이트로 돌아가기
              </span>
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
          {/* 내비게이션 패널이라 설명할 본문이 없다 — Radix에 없음을 명시 */}
          <SheetContent
            side="left"
            className="w-60 p-0"
            aria-describedby={undefined}
          >
            <div className="flex h-full flex-col">
              <div className="border-b border-neutral-200 px-4 py-5">
                <SheetTitle className="text-lg font-bold tracking-tight">
                  AMANG Admin
                </SheetTitle>
              </div>
              <div className="flex-1 px-3 py-4">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
              <div className="border-t border-neutral-200 px-3 py-4">
                <Link
                  href={ROUTES.HOME}
                  onClick={(e) => {
                    if (guardNavigation(ROUTES.HOME)) {
                      e.preventDefault()
                      return
                    }
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  사이트로 돌아가기
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
