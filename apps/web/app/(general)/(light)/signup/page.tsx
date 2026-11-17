import { cookies } from "next/headers"

import SignupForm from "@/app/(general)/(light)/signup/_components/SignupForm"
import { GuestOnly } from "@/components/GuestOnly"
import { ACCESS_TOKEN_COOKIE } from "@repo/shared-types"

const Signup = async () => {
  const hasSessionCookie = (await cookies()).has(ACCESS_TOKEN_COOKIE)

  return (
    <GuestOnly hasSessionCookie={hasSessionCookie}>
      <div className="flex h-full w-full items-center justify-center lg:py-20">
        <div className="-mx-4 flex h-full w-[calc(100%+2rem)] overflow-hidden bg-white md:mx-0 md:w-auto md:rounded-xl lg:w-[1156px] lg:shadow-2xl xl:w-[1536px]">
          <div
            className="hidden h-auto min-h-full w-full lg:block"
            style={{
              backgroundImage: `url('/gradients.svg')`,
              backgroundPosition: "top",
              backgroundSize: "cover"
            }}
          />
          <SignupForm />
        </div>
      </div>
    </GuestOnly>
  )
}

export default Signup
