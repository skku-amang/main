"use client"

import * as Sentry from "@sentry/nextjs"
import { Bug, CheckCircle2, Heart, Lightbulb } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import ROUTES from "@/constants/routes"
import { useAuth } from "@/lib/providers/auth-provider"
import { cn } from "@/lib/utils"

const MIN_LENGTH = 5

const KINDS = [
  {
    value: "bug",
    label: "버그",
    icon: Bug,
    placeholder: "어느 화면에서 무엇을 했을 때 어떤 문제가 있었나요?"
  },
  {
    value: "idea",
    label: "건의",
    icon: Lightbulb,
    placeholder: "불편한 점이나 있었으면 하는 기능을 알려주세요."
  },
  {
    value: "praise",
    label: "칭찬",
    icon: Heart,
    placeholder: "좋았던 점을 알려주세요. 개발자에게 큰 힘이 돼요!"
  }
] as const

type Kind = (typeof KINDS)[number]["value"]

/**
 * 전송 성공을 확인한 뒤에만 resolve. Sentry가 꺼진 환경(로컬·미리보기)은
 * 전송 완료 신호가 오지 않아 30초 타임아웃까지 기다리므로 바로 실패시킨다.
 */
const sendSuggestion = ({
  message,
  name,
  email,
  kind
}: {
  message: string
  name?: string
  email?: string
  kind: Kind
}) => {
  const client = Sentry.getClient()
  if (!client?.getDsn() || client.getOptions().enabled === false) {
    return Promise.reject(new Error("Sentry가 비활성화된 환경"))
  }
  // sendFeedback은 tags를 현재 scope에 setTags 하므로, 이후 에러 이벤트에 새지 않게 격리
  return Sentry.withScope(() =>
    Sentry.sendFeedback(
      {
        message,
        name,
        email,
        source: "suggestions-page",
        tags: { suggestion_kind: kind }
      },
      { includeReplay: kind === "bug" }
    )
  )
}

const SuggestionForm = () => {
  const { user, isLoading } = useAuth()
  const [kind, setKind] = useState<Kind>("idea")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  )

  const trimmed = message.trim()
  const current = KINDS.find((k) => k.value === kind)!

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (trimmed.length < MIN_LENGTH || status === "sending") return

    setStatus("sending")
    try {
      await sendSuggestion({
        message: trimmed,
        name: user?.name,
        email: user?.email,
        kind
      })
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-10 text-center shadow-sm">
        <CheckCircle2 className="size-12 text-primary" />
        <div className="space-y-1">
          <p className="text-lg font-semibold">보내주셔서 고마워요!</p>
          <p className="text-sm text-slate-500">
            개발자가 직접 읽고 반영 여부를 검토할게요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setMessage("")
              setStatus("idle")
            }}
          >
            하나 더 보내기
          </Button>
          <Button asChild>
            <Link href={ROUTES.HOME}>홈으로</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl bg-white p-6 shadow-sm md:p-8"
    >
      <p className="text-sm text-slate-500">
        아망 홈페이지를 쓰면서 느낀 점을 개발자에게 바로 전달해요. 운영진
        단톡방을 거치지 않아도 돼요.
      </p>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">어떤 의견인가요?</legend>
        <div className="grid grid-cols-3 gap-2">
          {KINDS.map(({ value, label, icon: Icon }) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 rounded-lg border py-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                kind === value
                  ? "border-primary bg-primary/5 font-semibold text-primary"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              )}
            >
              <input
                type="radio"
                name="kind"
                value={value}
                checked={kind === value}
                onChange={() => setKind(value)}
                className="sr-only"
              />
              <Icon className="size-5" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="suggestion-message"
          className="mb-2 block text-sm font-medium"
        >
          내용
        </label>
        <Textarea
          id="suggestion-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={current.placeholder}
          rows={6}
          maxLength={2000}
        />
        {!isLoading && (
          <p className="mt-1.5 text-xs text-slate-400">
            {user
              ? "답변이 필요할 때 연락드릴 수 있도록 이름과 이메일이 함께 전달돼요."
              : "로그인하지 않으면 익명으로 전달돼요."}
          </p>
        )}
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          전송에 실패했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={trimmed.length < MIN_LENGTH || status === "sending"}
      >
        {status === "sending" ? "보내는 중..." : "보내기"}
      </Button>
    </form>
  )
}

export default SuggestionForm
