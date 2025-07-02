import { Island_Moments, Ma_Shan_Zheng } from "next/font/google"

import { cn } from "../../lib/utils"

const MaShanZheng = Ma_Shan_Zheng({
  subsets: ["latin"],
  weight: "400",
  display: "swap"
})
const IslandMoments = Island_Moments({ subsets: ["latin"], weight: "400" })

const Title = () => {
  return (
    <p
      className={cn(
        MaShanZheng.className,
        "text-center opacity-60 drop-shadow-2xl"
      )}
      style={{
        fontSize: 500,
        color: "#2D316A"
      }}
    >
      Amang
    </p>
  )
}

const SubTitle = () => {
  return (
    <p
      className={cn(IslandMoments.className, "text-center drop-shadow-2xl")}
      style={{ fontSize: 80, color: "#4C3B27", transform: "translateY(-150%)" }}
    >
      Sungkyunkwan University Music Club
    </p>
  )
}

export default function Home() {
  return (
    <div
      className="fixed left-1/2 top-1/2 hidden lg:block"
      style={{
        transform: "translateY(-50%) translateX(-50%)",
        userSelect: "none"
      }}
    >
      <Title />
      <SubTitle />
    </div>
  )
}
