"use client"

import dayjs from "dayjs"
import { Check, Copy } from "lucide-react"
import { useRef, useState } from "react"

import { useToast } from "@/components/hooks/use-toast"
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
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  // 링크가 다른 회원 것으로 바뀌면 "복사됨"이 따라오지 않게, 복사한 주소를 기억한다
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const copied = !!link && copiedUrl === link.url

  const copy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link.url)
      setCopiedUrl(link.url)
    } catch {
      inputRef.current?.select()
      toast({
        title: "복사하지 못했어요",
        description: "링크를 선택해 두었어요. 직접 복사해주세요.",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={!!link} onOpenChange={onOpenChange}>
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
            ref={inputRef}
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
