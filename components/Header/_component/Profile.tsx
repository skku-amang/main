"use client"

import { LoaderCircle, LogOut, Moon, Settings, User, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

import ROUTES from "../../../constants/routes"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"

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

const setDarkMode = (value: boolean) => {
  if (value) {
    return document.documentElement.classList.add("dark")
  }
  document.documentElement.classList.remove("dark")
}

function Profile() {
  const { status, data: session } = useSession()

  if (!session) {
    return (
      <>
        {status === "loading" ? (
          <LoaderCircle className="animate-spin text-white" size={30} />
        ) : (
          <div className="flex justify-center gap-x-5 font-bold text-white">
            <Link href={ROUTES.LOGIN.url}>로그인</Link>|
            <Link href={ROUTES.SIGNUP.url}>회원가입</Link>
          </div>
        )}
      </>
    )
  }

  const iconSize = 20
  const RANDOM_PROFILE_IMAGE = "https://picsum.photos/50/50"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={session.user?.image ?? RANDOM_PROFILE_IMAGE} />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-lg">
        <DropdownMenuLabel className="flex items-center gap-x-3 py-3">
          <Avatar>
            <AvatarImage src={session.user?.image ?? RANDOM_PROFILE_IMAGE} />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div>
            <div>{session.user?.name}</div>
            <div className="font-normal">{session.user?.email}</div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <MenuItem
          icon={<User size={iconSize} />}
          href={ROUTES.PROFILE.INDEX.url}
        >
          내 프로필
        </MenuItem>
        <MenuItem icon={<Users size={iconSize} />} href="#">
          참여 중인 팀
        </MenuItem>

        <DropdownMenuSeparator />
        <MenuItem icon={<Settings size={iconSize} />} href="#">
          설정
        </MenuItem>
        <DropdownMenuItem
          className="flex items-center justify-start gap-x-3 hover:cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <Moon size={iconSize} />
          <Switch
            onCheckedChange={(v) => {
              localStorage.setItem("theme", v ? "dark" : "light")
              setDarkMode(v)
            }}
          />
          다크모드
        </DropdownMenuItem>

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
