import Link from 'next/link'

import { Button } from '@/components/ui/button'
import ROUTES from '@/constants/routes'

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
