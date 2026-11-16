"use client"

import dayjs from "dayjs"
import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export type PasswordResetLink = {
  name: string
  url: string
  expiresAt: string
}

interface Props {
  link: PasswordResetLink | null
  onOpenChange: (open: boolean) => void
}

/** 이메일을 인증하지 않은 회원에게 전달할 재설정 링크 (#528) */
export const PasswordResetLinkDialog = ({ link, onOpenChange }: Props) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link.url)
    setCopied(true)
  }

  return (
    <Dialog
      open={!!link}
      onOpenChange={(open) => {
        if (!open) setCopied(false)
        onOpenChange(open)
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{link?.name}님 비밀번호 재설정 링크</DialogTitle>
          <DialogDescription>
            본인에게 카톡 등으로 직접 보내주세요.{" "}
            {link && dayjs(link.expiresAt).format("M월 D일 HH:mm")}까지 한 번만
            쓸 수 있어요. 링크를 아는 사람은 누구나 비밀번호를 바꿀 수 있으니
            본인에게만 보내주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            readOnly
            aria-label="재설정 링크"
            value={link?.url ?? ""}
            onFocus={(e) => e.target.select()}
          />
          <Button type="button" onClick={copy} className="shrink-0">
            {copied ? (
              <Check className="mr-1.5 size-4" />
            ) : (
              <Copy className="mr-1.5 size-4" />
            )}
            {copied ? "복사됨" : "복사"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
