"use client"

import { LoaderCircle, LogOut, User, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import ROUTES from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

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
  const { isPending, data: session } = authClient.useSession()
  console.log("session:", session)
  console.debug("profileId:", session?.user?.profileId)

  const { signOut } = authClient

  if (!session) {
    return (
      <>
        {isPending ? (
          <LoaderCircle className="animate-spin text-white" size={30} />
        ) : (
          <Button
            className={cn(
              "text-white text-lg font-semibold rounded-full bg-blue-500 px-[37px] py-[10.5px]"
            )}
          >
            <Link href={ROUTES.LOGIN}>Login</Link>
          </Button>
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
        <MenuItem icon={<User size={iconSize} />} href={ROUTES.PROFILE.INDEX}>
          내 프로필
        </MenuItem>
        <MenuItem icon={<Users size={iconSize} />} href="#">
          참여 중인 팀
        </MenuItem>

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
