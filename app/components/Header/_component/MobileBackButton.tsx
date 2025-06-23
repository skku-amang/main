"use client"

import { ArrowLeftIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

const MobileBackButton = () => {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === "/"

  if (isHome) {
    return <div className="w-6" />
  }

  return (
    <button onClick={() => router.back()}>
      <ArrowLeftIcon className="h-6 w-6 text-white" />
    </button>
  )
}

export default MobileBackButton
