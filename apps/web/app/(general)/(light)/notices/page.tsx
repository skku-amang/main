import Link from "next/link"

import ROUTES from "@/constants/routes"
import { Button } from "@repo/ui/button"

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
