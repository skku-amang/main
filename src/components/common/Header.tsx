import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import NavLink from "@/components/common/NavLink"
import ROUTES from "../../../constants/routes"

export const HeaderInner = () => {
  const menuItems: { name: string, url: string, active: boolean }[] = [
    { name: "공지사항", url: ROUTES.NOTICE.LIST.url, active: false },
    { name: "공연목록", url: ROUTES.PERFORMANCE.LIST.url, active: true },
    { name: "세션지원", url: ROUTES.TEAM.LIST.url, active: true },
    { name: "부원목록", url: ROUTES.MEMBERS.LIST.url, active: true},
  ]

  return (
    <>
      {/* Tablet & Desktop */}
      <nav className="invisible md:visible flex items-center w-full px-10">
        <div className="flex items-center w-full lg:w-[1280px] justify-between mx-auto">
          {/* Logo */}
          <Link href="/">
            <Image src="/Logo.png" alt="logo" width={47} height={47} />
          </Link>

          {/* MenuItems */}
          <div className="flex justify-around w-1/2">
            {menuItems.map((menuItem) => (
              <NavLink key={menuItem.name} href={menuItem.url} active={menuItem.active}>{menuItem.name}</NavLink>
            ))}
          </div>

          {/* Personal */}
          <div
            className="flex justify-center gap-x-5 text-gray-700 font-bold">
            <Link href="/login" style={{ color: "#BEBEBE" }}>로그인</Link>
            |
            <Link href="/signup" style={{ color: "#BEBEBE" }}>회원가입</Link>
          </div>
        </div>
      </nav>
    </>
  )
}
const Header = ({ position, height }: { position: 'sticky' | 'fixed', height: string }) => {
  return (
    <header
      className={cn(position, "w-full flex justify-center top-0 backdrop-blur")}
      style={{ height }}
    >
      <HeaderInner />
    </header>
  )
}

export default Header