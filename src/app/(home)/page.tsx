import { Ma_Shan_Zheng } from "next/font/google"
import { Island_Moments } from "next/font/google"
import { cn } from "@/lib/utils"

const MaShanZheng = Ma_Shan_Zheng({subsets: ['latin'], weight: "400"})
const IslandMoments = Island_Moments({subsets: ['latin'], weight: '400'})

const Title = () => {
  return (
    <p
      className={cn(MaShanZheng.className, "drop-shadow-2xl opacity-60 text-center")}
      style={{
        fontSize: 500, color: "#2D316A",
      }}>
      Amang
    </p>
  )
}

const SubTitle = () => {
  return (
    <p
      className={cn(IslandMoments.className, "drop-shadow-2xl text-center")}
      style={{ fontSize: 80, color: "#4C3B27", transform: "translateY(-150%)" }}
      >
      Sungkyunkwan University Music Club
    </p>
  )
}

export default function Home() {
  return (
    <div
      className="invisible lg:visible fixed top-1/2 left-1/2"
      style={{
        transform: "translateY(-50%) translateX(-50%)",
        userSelect: "none",
        zIndex: -1
      }}
    >
      <Title />
      <SubTitle />
    </div>
  )
}
