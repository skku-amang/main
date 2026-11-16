"use client"

import { useEffect, useState } from "react"

import { Button, ButtonProps } from "@/components/ui/button"

// 서버의 재발송 간격과 같다 (EmailCodeService COOLDOWN_SECONDS)
const COOLDOWN_SECONDS = 60

interface Props extends Omit<ButtonProps, "onClick"> {
  /** 성공하면 대기 시간이 시작된다. 실패 처리는 부르는 쪽에서 (throw하면 대기 안 함) */
  onSend: () => Promise<void>
}

/** 이메일 인증번호 받기 버튼 — 보낸 뒤 60초 동안 "다시 받기 (n초)" */
const EmailCodeButton = ({ onSend, disabled, ...props }: Props) => {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (remaining <= 0) return
    const timer = setTimeout(() => setRemaining((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  const send = async () => {
    setSending(true)
    try {
      await onSend()
      setSent(true)
      setRemaining(COOLDOWN_SECONDS)
    } catch {
      // 오류 안내는 onSend가 맡는다
    } finally {
      setSending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || sending || remaining > 0}
      onClick={send}
      {...props}
    >
      {sending
        ? "보내는 중…"
        : remaining > 0
          ? `다시 받기 (${remaining}초)`
          : sent
            ? "다시 받기"
            : "인증번호 받기"}
    </Button>
  )
}

export default EmailCodeButton
