import { FEEDBACK_COMMENT_MAX } from "@repo/shared-types"
import { useEffect, useRef, useState } from "react"

const SAVE_DELAY_MS = 800

/**
 * 자유 의견. 입력을 멈추고 잠시 뒤, 칸을 떠날 때, 줄이 접히거나 페이지를 떠날 때 저장.
 * 저장에 실패하면 다음 입력·포커스 해제 때 다시 보낸다.
 */
const CommentField = ({
  value,
  disabled,
  onSave
}: {
  value: string | null
  disabled: boolean
  onSave: (comment: string) => Promise<boolean>
}) => {
  const [draft, setDraft] = useState(value ?? "")
  const saved = useRef(value ?? "")
  const saving = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 접힐 때(언마운트) 정리 함수가 최신 값을 쓰도록
  const latest = useRef({ draft, onSave })
  latest.current = { draft, onSave }

  const flush = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    const { draft: text, onSave: save } = latest.current
    if (text === saved.current) return
    const previous = saved.current
    saved.current = text
    saving.current += 1
    void save(text).then((ok) => {
      saving.current -= 1
      if (!ok && saved.current === text) saved.current = previous
    })
  }

  useEffect(() => {
    if (draft === saved.current) return
    timer.current = setTimeout(flush, SAVE_DELAY_MS)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
    // flush는 latest ref로 최신 값을 읽으므로 draft만 보면 된다
  }, [draft])

  // 다른 기기에서 고친 의견이 다시 불러와지면, 여기서 쓰던 중이 아닐 때만 반영한다
  useEffect(() => {
    // 저장 중에 저장 전 값이 다시 불러와져도 쓴 글을 덮지 않는다. 저장이 끝나면 페이지가 다시 불러온다
    if (saving.current > 0 || draft !== saved.current) return
    setDraft(value ?? "")
    saved.current = value ?? ""
    // value가 바뀔 때만 맞춘다 — draft를 넣으면 입력 중에 덮어쓴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // iOS Safari는 다른 곳을 탭해도 blur가 안 날 때가 많다 — 사라질 때 남은 의견을 저장
  useEffect(() => () => flush(), [])

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
