import Image from "next/image"
import Link from "next/link"
import { FaInstagram } from "react-icons/fa"
import { FaYoutube } from "react-icons/fa"

import { cn } from "../lib/utils"

export const FooterInner = ({
  className,
  height
}: {
  className?: string
  height: string
}) => {
  return (
    <div
      className={cn(
        className,
        "bottom-0 flex w-full items-center justify-center gap-x-10"
      )}
      style={{ height }}
    >
      <Link href="/">
        <Image src="/Logo.png" alt="logo" width={47} height={47} />
      </Link>
      <p className="font-extrabold" style={{ color: "#7E7E7E" }}>
        성균관대학교 자유음악동아리 아망
      </p>

      <div className="flex gap-x-5">
        <Link href="/">
          <FaYoutube size={30} style={{ color: "#BEBEBE" }} />
        </Link>
        <Link href="/">
          <FaInstagram size={30} style={{ color: "#BEBEBE" }} />
        </Link>
      </div>
    </div>
  )
}

const Footer = ({
  className,
  height
}: {
  className?: string
  height: string
}) => {
  return (
    <footer
      className={cn(
        className,
        "hidden w-[1440px] md:block min-[1440px]:w-full"
      )}
      style={{
        height,
        transform: "translateY(-100%)"
      }}
    >
      <FooterInner height={height} />
    </footer>
  )
}

export default Footer
