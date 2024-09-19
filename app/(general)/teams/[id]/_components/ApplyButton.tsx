"use client"

import { Button } from "@/components/ui/button"
import { SessionName } from "@/types/Session"

interface ApplyButtonProps {
  session: SessionName
}

const ApplyButton = ({ session }: ApplyButtonProps) => {
  async function onApply() {
    // const res = await fetchData(API_ENDPOINTS.TEAM.APPLY(), {
    //   team: teamId,
    //   session
    // })
  }

  return (
    <div className="rounded border px-10 py-3">
      <div className="mb-2 text-center">{session}</div>
      <div className="flex justify-center">
        <Button className="h-7 text-sm" onClick={onApply}>
          지원하기
        </Button>
      </div>
    </div>
  )
}

export default ApplyButton
