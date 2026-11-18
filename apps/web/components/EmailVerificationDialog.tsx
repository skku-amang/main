"use client"

import { ApiError } from "@repo/api-client"
import { EMAIL_CODE_LENGTH } from "@repo/shared-types"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import EmailCodeButton from "@/components/EmailCodeButton"
import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ME_QUERY_KEY } from "@/hooks/api/useAuth"
import { apiClient } from "@/lib/apiClient"

const errorText = (error: unknown) =>
  error instanceof ApiError
    ? (error.detail ?? error.message)
    : "잠시 후 다시 시도해주세요."

interface Props {
  email: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** 로그인한 회원이 자기 이메일을 인증하는 창 (#528) */
const EmailVerificationDialog = ({ email, open, onOpenChange }: Props) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const send = async () => {
    try {
      await apiClient.requestEmailVerification()
      setError(null)
    } catch (e) {
      setError(errorText(e))
      throw e
    }
  }

  const confirm = async () => {
    setConfirming(true)
    try {
      const user = await apiClient.confirmEmailVerification(code)
      queryClient.setQueryData(ME_QUERY_KEY, user)
      toast({
        title: "이메일을 인증했어요",
        description: "이제 비밀번호를 잊어도 이 메일로 찾을 수 있어요."
      })
      onOpenChange(false)
    } catch (e) {
      setError(errorText(e))
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[420px]">
        <DialogHeader>
          <DialogTitle>이메일 인증</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-slate-900">{email}</span>로
            인증번호를 보내드려요.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            void confirm()
          }}
        >
          <div className="flex gap-2">
            <Input
              aria-label="인증번호"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={EMAIL_CODE_LENGTH}
              placeholder={`${EMAIL_CODE_LENGTH}자리 숫자`}
            />
            <EmailCodeButton onSend={send} className="shrink-0" />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <p className="text-xs text-slate-500">
            메일이 안 보이면 스팸함도 확인해주세요. 주소가 틀렸다면 운영진에게
            고쳐 달라고 요청해주세요.
          </p>
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={code.length !== EMAIL_CODE_LENGTH || confirming}
            >
              인증하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EmailVerificationDialog
