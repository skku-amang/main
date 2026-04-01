import Image from "next/image"
import Link from "next/link"
import { FaInstagram, FaYoutube } from "react-icons/fa"

import SOCIAL from "@/constants/social"
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
      className={cn(className, "bottom-0 w-full")}
      style={{ height }}
    >
      {/* Win2000 Taskbar */}
      <div
        className="flex h-full w-full items-center justify-between px-1"
        style={{
          background: "linear-gradient(to bottom, #1f6fb5 0%, #1259a8 50%, #0e4d96 100%)",
          borderTop: "1px solid #5392d0",
          boxShadow: "0 -1px 0 #0a3a7a"
        }}
      >
        {/* Start button area */}
        <div className="flex items-center gap-2">
          <button
            className="win-start-btn"
            style={{ fontFamily: "Franklin Gothic Medium, Tahoma, sans-serif", fontSize: "13px" }}
          >
            <span style={{ fontSize: "16px" }}>🪟</span>
            start
          </button>

          {/* Quick launch separator */}
          <div
            style={{
              width: "2px",
              height: "24px",
              borderLeft: "1px solid #0a3a7a",
              borderRight: "1px solid #5392d0",
              margin: "0 4px"
            }}
          />

          {/* Taskbar buttons */}
          <div
            className="flex items-center gap-1 px-2 py-1"
            style={{
              background: "rgba(0,0,40,0.4)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "2px",
              minWidth: "150px",
              height: "22px",
              color: "white",
              fontSize: "11px",
              fontFamily: "Tahoma, sans-serif"
            }}
          >
            <span style={{ fontSize: "12px" }}>🎵</span>
            <span>Amang - 홈</span>
          </div>
        </div>

        {/* System tray */}
        <div
          className="flex items-center gap-2 px-2"
          style={{
            background: "rgba(0,0,40,0.3)",
            border: "1px solid rgba(0,0,0,0.4)",
            borderRadius: "2px",
            height: "22px",
            color: "white",
            fontFamily: "Tahoma, sans-serif"
          }}
        >
          <Link
            href={SOCIAL.Youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            title="YouTube"
          >
            <FaYoutube size={14} className="text-white opacity-80 hover:opacity-100" />
          </Link>
          <Link
            href={SOCIAL.Instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
          >
            <FaInstagram size={14} className="text-white opacity-80 hover:opacity-100" />
          </Link>
          <div
            style={{
              width: "1px",
              height: "14px",
              borderLeft: "1px solid rgba(0,0,0,0.4)",
              borderRight: "1px solid rgba(255,255,255,0.3)"
            }}
          />
          <span style={{ fontSize: "11px", whiteSpace: "nowrap" }}>
            {new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
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
      className={cn(className, "hidden w-[1440px] md:block min-[1440px]:w-full")}
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
