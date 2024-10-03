import { FileText, ImageIcon, LogIn, Megaphone, Music4 } from "lucide-react"
import Link from "next/link"
import { FaInstagram } from "react-icons/fa"
import { RiYoutubeLine } from "react-icons/ri"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import ROUTES from "@/constants/routes"

const iconcolor = "text-gray-500"

const SheetInnerContent = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <Link
        href={ROUTES.LOGIN.url}
        className="flex h-[10%] w-full items-center justify-start py-[4%]"
      >
        <Avatar className="h-12 w-12">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="w-full pl-4">
          <div className="h-full w-full text-center text-lg font-semibold text-black">
            로그인 <br />
            해주세요
          </div>
        </div>
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
          href={ROUTES.TEAM.LIST.url}
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
        <div className="flex h-[41.4%] w-full items-center text-gray-500">
          <RiYoutubeLine size={30} className={iconcolor} />
          <div className="pl-4 text-lg font-medium text-gray-500">YouTube</div>
        </div>
        <div className="flex h-[41.4%] w-full items-center text-gray-500">
          <FaInstagram size={30} className={iconcolor} />
          <div className="pl-4 text-lg font-medium text-gray-500">
            Instagram
          </div>
        </div>
      </div>
      <Link
        href={ROUTES.LOGIN.url}
        className="flex h-[9%] w-full items-center justify-center gap-4 pt-[85%]"
      >
        <LogIn size={30} className={iconcolor} />
        <div className="text-xl font-medium text-primary">Login Account</div>
      </Link>
    </div>
  )
}

export default SheetInnerContent
