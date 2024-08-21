import { Ma_Shan_Zheng } from "next/font/google"
import { Island_Moments } from "next/font/google"
import { cn } from "@/lib/utils"
import { HeaderInner } from "../../components/common/Header"
import { FooterInner } from "../../components/common/Footer"
import Image from "next/image"

const MaShanZheng = Ma_Shan_Zheng({subsets: ['latin'], weight: "400"})
const IslandMoments = Island_Moments({subsets: ['latin'], weight: '400'})

export default function Home() {
  return (
      <div
        className="h-full w-full"
        style={{
          backgroundImage: `url('Music band_pixabay 1.png')`,
          backgroundPosition: 'center',
          filter: "brightness(100%)" }}
      >
        <div
          className="invisible lg:visible fixed top-1/2 left-1/2"
          style={{
            transform: "translateY(0%) translateX(-50%)",
            userSelect: "none",
            zIndex: -1
          }}
        >
          <p
            className={cn(MaShanZheng.className, "drop-shadow-2xl opacity-60 text-center")}
            style={{
              fontSize: 500, color: "#2D316A",
            }}>
            Amang
          </p>
          <p
            className={cn(IslandMoments.className, "drop-shadow-2xl text-center")}
            style={{ fontSize: 50, color: "#4C3B27", transform: "translateY(-200%)" }}
            >
            Sungkyunkwan University Music Club
          </p>
        </div>
      </div>
  )
}
