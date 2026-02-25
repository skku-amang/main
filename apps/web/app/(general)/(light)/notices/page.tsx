import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"

export const metadata: Metadata = {
  title: "공지사항",
  description: "AMANG 동아리 공지사항",
  alternates: { canonical: "/notices" }
}

const NoticeList = () => {
  return (
    <>
      <Button asChild>
        <Link href={ROUTES.NOTICE.CREATE}>추가</Link>
      </Button>

      <div></div>
    </>
  )
}

export default NoticeList
