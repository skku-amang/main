"use Client"

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import {
  Archive,
  Building2,
  Instagram,
  LogIn,
  Package,
  Users,
  Youtube
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { FaCircle } from "react-icons/fa"

import { Separator } from "@/components/ui/separator"
import ROUTES, { DEFAULT_PERFORMANCE_ID } from "@/constants/routes"
import SOCIAL from "@/constants/social"

import NavLink from "./NavLink"
import NavLinkHeader from "./NavLinkHeader"

const iconSize = 24
const iconcolor = "text-gray-500"

// eslint-disable-next-line no-unused-vars
const SheetInnerContent = ({
  setIsOpen
}: {
  setIsOpen: (state: boolean) => void
}) => {
  const { data: session } = useSession()

  return (
    <div className="flex h-full flex-col justify-between">
      <Link
        href={!session ? ROUTES.LOGIN : ROUTES.PROFILE.INDEX}
        className="flex w-full items-center justify-start py-3"
      >
        {!session ? (
          <>
            <FaCircle className="h-14 w-14 text-gray-100"></FaCircle>
            <div className="w-full">
              <div className="h-full w-full pl-2 text-left font-medium text-black">
                로그인 해주세요
              </div>
            </div>
          </>
        ) : (
          <>
            <Avatar className="h-13 w-16 overflow-hidden rounded-full">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="w-full">
              <div className="h-5 w-full pl-3 text-left text-lg font-semibold text-black">
                {session.user?.name}
              </div>
              <div className="h-1/6 w-full pl-3 pt-2 text-left text-sm text-gray-400 underline">
                <span>&gt;</span> 마이페이지
              </div>
            </div>
          </>
        )}
      </Link>
      <Separator />
      <div className="flex-auto ">
        {/* Main */}
        <div className="my-6">
          <NavLinkHeader className="mb-4">MAIN</NavLinkHeader>

          <div className="space-y-7">
            <NavLink
              href={ROUTES.PERFORMANCE.TEAM.LIST(DEFAULT_PERFORMANCE_ID)}
              icon={<Users size={iconSize} className={iconcolor} />}
              onClick={() => setIsOpen(false)}
            >
              팀 모집
            </NavLink>
            <span className="flex w-full cursor-not-allowed items-center gap-x-4 text-gray-300">
              <Building2 size={iconSize} />
              <span className="text-lg font-medium">공간 대여</span>
            </span>
            <span className="flex w-full cursor-not-allowed items-center gap-x-4 text-gray-300">
              <Package size={iconSize} />
              <span className="text-lg font-medium">물품 대여</span>
            </span>
            <NavLink
              href={ROUTES.PERFORMANCE.LIST}
              icon={<Archive size={iconSize} className={iconcolor} />}
              onClick={() => setIsOpen(false)}
            >
              아카이브
            </NavLink>
          </div>
        </div>
        <Separator />
        {/* Links */}
        <div className="my-6">
          <NavLinkHeader className="mb-4">LINKS</NavLinkHeader>

          <div className="space-y-7">
            <NavLink
              href={SOCIAL.Youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              icon={<Youtube size={iconSize} className={iconcolor} />}
            >
              YouTube
            </NavLink>
            <NavLink
              href={SOCIAL.Instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              icon={<Instagram size={iconSize} className={iconcolor} />}
            >
              Instagram
            </NavLink>
          </div>
        </div>
      </div>

      {/* Login & Logout */}
      <div className="flex w-full items-center justify-center gap-4">
        {!session ? (
          <>
            <LogIn size={iconSize} className="text-primary" />
            <Link
              href={ROUTES.LOGIN}
              className="text-xl font-medium text-primary"
            >
              Login Account
            </Link>
          </>
        ) : (
          <button
            type="button"
            className="flex cursor-pointer items-center gap-4 text-red-600"
            onClick={() => signOut()}
          >
            <LogIn size={iconSize} />
            <span className="text-xl font-medium">Logout Account</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default SheetInnerContent
