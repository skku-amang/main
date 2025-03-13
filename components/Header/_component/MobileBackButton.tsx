"use client"

import { ArrowLeftIcon } from "lucide-react"
import { useRouter } from "next/navigation"

const MobileBackButton = () => {
  const router = useRouter()

  return (
    <button onClick={() => router.back()}>
      <ArrowLeftIcon className="h-6 w-6 text-white" />
    </button>
  )
}

export default MobileBackButton
