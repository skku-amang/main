import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import NavLink from "@/components/common/NavLink"

const Header = ({ position }: { position: "static" | "relative" | "absolute" | "fixed" | "sticky" }) => {
  const menuItems: { text: string, href: string }[] = [
    { text: "공지사항", href: "/notices" },
    { text: "공연팀 생성", href: "/teams/create"},
    { text: "세션 지원", href: "/teams"},
    { text: "사진앨범", href: "/gallery"},
  ]
  return (
    <header
      className={cn(position, "w-full flex justify-center top-0")}
    >
      <nav className="flex h-20 w-[1280px] items-center justify-between">
        {/* Logo */}
        <Link href="/" className="w-32 flex justify-center">
          <Image src="/Logo.png" alt="logo" width={47} height={47} />
        </Link>

        {/* MenuItems */}
        <div className="flex justify-around w-1/2">
          {menuItems.map((menuItem) => (
            <NavLink key={menuItem.text} href={menuItem.href}>{menuItem.text}</NavLink>
          ))}
        </div>

        {/* Personal */}
        <div
          className="flex justify-center gap-x-5 w-64 text-gray-700 font-bold">
          <Link href="/login" style={{ color: "#BEBEBE" }}>로그인</Link>
          |
          <Link href="/signup" style={{ color: "#BEBEBE" }}>회원가입</Link>
        </div>
      </nav>
    </header>
  )
}

export default Header