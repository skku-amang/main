"use client"

import { MailCheck, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import EmailVerificationDialog from "@/components/EmailVerificationDialog"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { useAuth } from "@/lib/providers/auth-provider"

const SNOOZE_KEY = "email-verify-ask-snoozed-until"
const SNOOZE_DAYS = 7

export const readEmailAskSnoozed = () => {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) ?? 0) > Date.now()
  } catch {
    return false
  }
}

const snooze = () => {
  try {
    localStorage.setItem(
      SNOOZE_KEY,
      String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000)
    )
  } catch {
    // 저장 불가 환경(시크릿 등)이면 이번 세션만 닫힘
  }
}

/**
 * 이메일을 인증하지 않은 기존 회원에게 인증을 권하는 배너 (#528).
 * 인증된 메일로만 비밀번호를 찾을 수 있어서다. 내 정보 수정에는 같은 버튼이 있어 띄우지 않는다.
 */
const EmailVerifyAsk = () => {
  const pathname = usePathname()
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setDismissed(readEmailAskSnoozed())
  }, [])

  if (!user || user.emailVerifiedAt) return null
  if (pathname === ROUTES.PROFILE.EDIT) return null

  const close = () => {
    snooze()
    setDismissed(true)
  }

  return (
    <>
      {!dismissed && (
        <div
          role="region"
          aria-label="이메일 인증 안내"
          className="fixed inset-x-4 bottom-[calc(var(--tabbar-height)+12px)] z-40 mx-auto max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-lg md:inset-x-auto md:bottom-6 md:right-6"
        >
          <div className="flex items-start gap-x-3">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">이메일을 인증해 주세요</p>
              <p className="mt-1 text-sm text-slate-600">
                인증해 두면 비밀번호를 잊었을 때 직접 찾을 수 있어요.
              </p>
              <div className="mt-3 flex gap-x-2">
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  인증하기
                </Button>
                <Button size="sm" variant="ghost" onClick={close}>
                  나중에
                </Button>
              </div>
            </div>
            <button
              type="button"
              aria-label="닫기"
              onClick={close}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
      <EmailVerificationDialog
        email={user.email}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}

export default EmailVerifyAsk
