"use client"

import SignupForm from "@/app/(general)/(light)/signup/_components/SignupForm"
import { useGenerations } from "@/hooks/api/useGeneration"
import { useSessions } from "@/hooks/api/useSession"

const Signup = () => {
  const { data: sessions } = useSessions()
  const { data: generations } = useGenerations()

  if (!sessions || !generations) {
    return
  }

  return (
    <div className="flex h-full w-full items-center justify-center lg:py-20">
      <div className="flex h-full overflow-hidden rounded-xl bg-white lg:w-[1156px] lg:shadow-2xl xl:w-[1536px]">
        <div
          className="hidden h-auto min-h-full w-full lg:block"
          style={{
            backgroundImage: `url('/gradients.svg')`,
            backgroundPosition: "top",
            backgroundSize: "cover"
          }}
        />
        <SignupForm sessionIds={sessions} generations={generations} />
      </div>
    </div>
  )
}

export default Signup
