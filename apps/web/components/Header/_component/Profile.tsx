"use client"

import { LoaderCircle, LogOut, Settings, Users } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import ROUTES from "@/constants/routes"

interface MenuItemProps {
  icon: React.ReactNode
  href?: string
  children: React.ReactNode
}

const MenuItem = ({ icon, href, children }: MenuItemProps) => {
  const router = useRouter()

  return (
    <DropdownMenuItem
      className="flex items-center justify-start gap-x-3 hover:cursor-pointer"
      onSelect={() => {
        if (href) router.push(href)
      }}
    >
      {icon}
      {children}
    </DropdownMenuItem>
  )
}

const Profile = () => {
  const router = useRouter()
  const { status, data: session } = useSession()

  if (!session) {
    return (
      <>
        {status === "loading" ? (
          <LoaderCircle className="animate-spin text-foreground" size={16} />
        ) : (
          <button className="win-btn">
            <Link href={ROUTES.LOGIN} style={{ fontFamily: "Tahoma, sans-serif", fontSize: "11px", color: "#000", textDecoration: "none" }}>
              로그인
            </Link>
          </button>
        )}
      </>
    )
  }

  const iconSize = 20
  const profileImage =
    session.user?.image ??
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(session.user?.email ?? "")}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={profileImage} />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-lg">
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-x-3 rounded-sm py-3 hover:bg-accent"
          onSelect={() => router.push(ROUTES.PROFILE.INDEX)}
        >
          <Avatar>
            <AvatarImage src={profileImage} />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div>
            <div>{session.user?.name}</div>
            <div className="font-normal">{session.user?.email}</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <MenuItem icon={<Users size={iconSize} />} href={ROUTES.PROFILE.TEAMS}>
          참여 중인 팀
        </MenuItem>

        {session.user?.isAdmin && (
          <>
            <DropdownMenuSeparator />
            <MenuItem
              icon={<Settings size={iconSize} />}
              href={ROUTES.ADMIN.INDEX}
            >
              관리자
            </MenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => signOut()}
          className="flex h-full w-full items-center justify-start gap-x-3 p-2 hover:cursor-pointer"
        >
          <LogOut size={iconSize} />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Profile
