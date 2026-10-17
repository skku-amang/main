import { X } from "lucide-react"
import { ReactNode, useEffect, useState } from "react"

const STORAGE_KEY = "amang:team-list-view-tip-seen"

/** 보기 전환 팁을 아직 안 봤으면 true. 서버 렌더와 어긋나지 않도록 마운트 후에 읽는다 */
export const useViewTip = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true)
    } catch {
      // 저장소를 못 쓰면 매번 뜨지 않도록 안 보여 준다
    }
  }, [])

  const dismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // 저장 못 해도 이번 방문 동안은 닫힌 채로
    }
  }

  return [show, dismiss] as const
}

/** 휴대폰 보기 전환 버튼(아이콘만 있음) 아래 말풍선 */
export const ViewTip = ({
  show,
  onDismiss,
  children
}: {
  show: boolean
  onDismiss: () => void
  children: ReactNode
}) => (
  <div className="relative shrink-0">
    {children}
    {show && (
      <div
        role="status"
        className="absolute right-0 top-full z-20 mt-2 flex w-max max-w-[200px] items-start gap-2 rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md animate-in fade-in-0"
      >
        <span className="absolute -top-1.5 right-4 size-3 rotate-45 border-l border-t bg-popover" />
        <span>여기서 카드/표 보기를 바꿀 수 있어요</span>
        <button
          type="button"
          aria-label="팁 닫기"
          onClick={onDismiss}
          className="shrink-0 text-slate-400 hover:text-slate-600"
        >
          <X className="size-4" />
        </button>
      </div>
    )}
  </div>
)
