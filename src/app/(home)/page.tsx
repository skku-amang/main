import { Ma_Shan_Zheng } from "next/font/google"
import { Island_Moments } from "next/font/google"
import { cn } from "@/lib/utils"
import Header from "../../../components/common/Header"
import Footer from "../../../components/common/Footer"

const MaShanZheng = Ma_Shan_Zheng({subsets: ['latin'], weight: "400"})
const IslandMoments = Island_Moments({subsets: ['latin'], weight: '400'})

export default function Home() {
  return (
    <main
      className={cn("flex flex-col h-screen w-full items-center justify-center")}
      
      >
      <div
        className="h-full w-full"
        style={{
          backgroundImage: `url('Music band_pixabay 1.png')`,
          backgroundPosition: 'center',
          filter: "brightness(100%)" }}
      >
        <Header position="fixed" />
        {/* <p
          className={cn(MaShanZheng.className, "drop-shadow-2xl opacity-60 text-center")}
          style={{ fontSize: 500, color: "#2D316A" }}>
          Amang
        </p>
        <p
          className={cn(IslandMoments.className, "drop-shadow-2xl")}
          style={{ color: "#4C3B27" }}
          >
          Sungkyunkwan University Music Club
        </p> */}
        <Footer position="fixed" />
      </div>
    </main>
  )
}
