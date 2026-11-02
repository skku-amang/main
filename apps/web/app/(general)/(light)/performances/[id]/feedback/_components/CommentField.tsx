import { FEEDBACK_COMMENT_MAX } from "@repo/shared-types"
import { useEffect, useRef, useState } from "react"

const SAVE_DELAY_MS = 800

/** 자유 의견. 입력을 멈추고 잠시 뒤, 또는 칸을 떠날 때 저장 */
const CommentField = ({
  value,
  disabled,
  onSave
}: {
  value: string | null
  disabled: boolean
  onSave: (comment: string) => void
}) => {
  const [draft, setDraft] = useState(value ?? "")
  const saved = useRef(value ?? "")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    if (draft === saved.current) return
    saved.current = draft
    onSave(draft)
  }

  useEffect(() => {
    if (draft === saved.current) return
    timer.current = setTimeout(flush, SAVE_DELAY_MS)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
    // flush는 매 렌더 새로 만들어지지만 draft가 같으면 같은 일을 한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  return (
    <textarea
      value={draft}
      disabled={disabled}
      maxLength={FEEDBACK_COMMENT_MAX}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={flush}
      rows={2}
      placeholder="자유 의견 (선택) — 결과 발표 뒤 팀에게 익명으로 전달돼요"
      className="mt-2 w-full resize-none rounded-md border border-slate-300 p-2 text-sm focus:border-blue-900 focus:outline-none disabled:bg-slate-50"
    />
  )
}

export default CommentField
