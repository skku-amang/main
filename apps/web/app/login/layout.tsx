import { cookies } from "next/headers"

import { GuestOnly } from "@/components/GuestOnly"
import RootHeaderAndFooterWrapper from "@/components/RootHeaderAndFooterWrapper"
import { ACCESS_TOKEN_COOKIE } from "@repo/shared-types"

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const hasSessionCookie = (await cookies()).has(ACCESS_TOKEN_COOKIE)

  return (
    <RootHeaderAndFooterWrapper
      headerMode="light"
      mainClassName="items-center flex"
    >
      <GuestOnly hasSessionCookie={hasSessionCookie}>{children}</GuestOnly>
    </RootHeaderAndFooterWrapper>
  )
}
