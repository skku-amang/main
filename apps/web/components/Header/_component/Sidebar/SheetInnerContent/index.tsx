"use Client"

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import {
  FileText,
  ImageIcon,
  Instagram,
  LogIn,
  Megaphone,
  Music4,
  Youtube
} from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
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
    <div className="items-between flex h-full flex-col justify-center">
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
                {session.name}
              </div>
              <div className="h-1/6 w-full pl-3 pt-2 text-left text-sm text-gray-400">
                <span>&gt;</span> 마이페이지
              </div>
            </div>
          </>
        )}
      </Link>
      <Separator />
      <div className="flex-auto ">
        {/* Main */}
        <div className="my-5">
          <NavLinkHeader className="mb-3">MAIN</NavLinkHeader>

          <div className="space-y-7">
            <NavLink
              href={ROUTES.NOTICE.LIST}
              icon={<Megaphone size={iconSize} className={iconcolor} />}
              onClick={() => setIsOpen(false)}
            >
              공지사항
            </NavLink>
            <NavLink
              href={ROUTES.PERFORMANCE.LIST}
              icon={<Music4 size={iconSize} className={iconcolor} />}
              onClick={() => setIsOpen(false)}
            >
              공연목록
            </NavLink>
            <NavLink
              href={ROUTES.PERFORMANCE.TEAM.LIST(DEFAULT_PERFORMANCE_ID)}
              icon={<FileText size={iconSize} className={iconcolor} />}
              onClick={() => setIsOpen(false)}
            >
              세션지원
            </NavLink>
            <NavLink
              href={ROUTES.MEMBER.LIST}
              icon={<ImageIcon size={iconSize} className={iconcolor} />}
              onClick={() => setIsOpen(false)}
            >
              멤버목록
            </NavLink>
          </div>
        </div>
        <Separator />
        {/* Links */}
        <div className="my-5">
          <NavLinkHeader className="mb-3">LINKS</NavLinkHeader>

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
          <>
            <LogIn
              onClick={() => signOut()}
              size={iconSize}
              className="cursor-pointer text-red-600"
            />
            <div
              className="cursor-pointer text-xl font-medium text-red-600"
              onClick={() => signOut()}
            >
              Logout Account
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SheetInnerContent
