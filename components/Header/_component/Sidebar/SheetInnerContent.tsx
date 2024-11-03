"use Client"
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

import ROUTES from "@/constants/routes"
import SOTIAL from "@/constants/social"
const iconcolor = "text-gray-500"

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { FaCircle } from "react-icons/fa"

import { Separator } from "@/components/ui/separator"

const SheetInnerContent = () => {
  const { data: session } = useSession()

  return (
    <div className="relative flex h-full w-full flex-col">
      <Link
        href={!session ? ROUTES.LOGIN.url : ROUTES.PROFILE.INDEX.url}
        className="flex h-[10%] w-full items-center justify-start py-[4%]"
      >
        {!session ? (
          <>
            <FaCircle className="h-14 w-14 text-gray-100"></FaCircle>
            <div className="w-full">
              <div className="h-full w-full pl-2 text-left text-base font-medium text-black">
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
            <div className="w-full ">
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
      <div className="h-[40%] w-full pt-[2%]">
        <div className="h-[12%] w-full pb-[8%] text-base text-gray-500">
          MAIN
        </div>
        <Link
          href={ROUTES.NOTICE.LIST.url}
          className="flex h-[22%] w-full items-center text-lg font-medium text-gray-500"
        >
          <Megaphone size={30} className={iconcolor} />
          <div className="pl-4 text-lg font-medium text-gray-500">공지사항</div>
        </Link>
        <Link
          href={ROUTES.PERFORMANCE.LIST.url}
          className="flex h-[22%] w-full items-center text-lg font-medium text-gray-500"
        >
          <Music4 size={30} className={iconcolor} />
          <div className="pl-4 text-lg font-medium text-gray-500">공연목록</div>
        </Link>
        <Link
          href={ROUTES.PERFORMANCE.TEAMS(1).url} // TODO: 실제 기본 공연 ID로 변경
          className="flex h-[22%] w-full items-center text-lg font-medium text-gray-500"
        >
          <FileText size={30} className={iconcolor} />
          <div className="pl-4 text-lg font-medium text-gray-500">세션지원</div>
        </Link>
        <Link
          href={ROUTES.MEMBER.LIST.url}
          className="flex h-[22%] w-full items-center text-lg font-medium text-gray-500"
        >
          <ImageIcon size={30} className={iconcolor} />
          <div className="pl-4 text-lg font-medium text-gray-500">멤버목록</div>
        </Link>
      </div>
      <Separator />
      <div className="flex h-[24%] w-full flex-col justify-start pt-[2%]">
        <div className="h-[21.6%] w-full pb-[13.3%] text-base text-gray-500">
          LINKS
        </div>
        <Link
          href={SOTIAL.Youtube.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[41.4%] w-full items-center text-gray-500"
        >
          <Youtube size={30} className={iconcolor} />
          <div className="pl-4 text-lg font-medium text-gray-500">YouTube</div>
        </Link>
        <Link
          href={SOTIAL.Instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[41.4%] w-full items-center text-gray-500"
        >
          <Instagram size={30} className={iconcolor} />
          <div className="pl-4 text-lg font-medium text-gray-500">
            Instagram
          </div>
        </Link>
      </div>
      <div className="flex h-[9%] w-full items-center justify-center gap-4 pt-[85%]">
        {!session ? (
          <>
            <LogIn size={30} className="text-primary" />
            <Link
              href={ROUTES.LOGIN.url}
              className="text-xl font-medium text-primary"
            >
              Login Account
            </Link>
          </>
        ) : (
          <>
            <LogIn
              onClick={() => signOut()}
              size={30}
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
