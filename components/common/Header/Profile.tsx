import Link from 'next/link'
import React from 'react'
import { CiSettings } from 'react-icons/ci'
import { HiOutlineUserGroup } from 'react-icons/hi2'
import { IoIosLogOut } from 'react-icons/io'
import { IoPersonOutline } from 'react-icons/io5'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { auth, signOut } from '../../../auth'
import ROUTES from '../../../constants/routes'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'

interface MenuItemProps {
  icon: React.ReactNode
  href?: string
  children: React.ReactNode
}

const MenuItem = ({ icon, href, children }: MenuItemProps) => {
  return (
    <DropdownMenuItem className="p-0">
      {href ? (
        <Link
          href={href}
          className="flex h-full w-full items-center justify-start gap-x-3 p-2"
        >
          {icon}
          {children}
        </Link>
      ) : (
        <div className="flex h-full w-full items-center justify-start gap-x-3 p-2">
          {icon}
          {children}
        </div>
      )}
    </DropdownMenuItem>
  )
}

async function Profile() {
  const session = await auth()
  const RANDOM_PROFILE_IMAGE = 'https://picsum.photos/50/50'

  if (!session) {
    return (
      <div className="flex justify-center gap-x-5 font-bold text-white">
        <Link href={ROUTES.LOGIN.url}>로그인</Link>|
        <Link href={ROUTES.SIGNUP.url}>회원가입</Link>
      </div>
    )
  }

  const iconSize = 20

  return (
    <div className="flex items-center justify-center gap-x-3">
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
          <MenuItem icon={<IoPersonOutline size={iconSize} />} href="/profile">
            내 프로필
          </MenuItem>
          <MenuItem
            icon={<HiOutlineUserGroup size={iconSize} />}
            href="/profile"
          >
            참여 중인 팀
          </MenuItem>

          <DropdownMenuSeparator />
          <MenuItem icon={<CiSettings size={iconSize} />} href="/profile">
            설정
          </MenuItem>

          <DropdownMenuSeparator />
          <MenuItem icon={<IoIosLogOut size={iconSize} />}>
            <form
              action={async () => {
                'use server'
                await signOut()
              }}
            >
              <button type="submit" className="flex">
                로그아웃
              </button>
            </form>
          </MenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Profile
