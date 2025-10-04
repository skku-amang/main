import { cn } from "@/lib/utils"

interface TooltipCustomedProps {
  /** 안내 문구 (자동 줄바꿈 적용됨) */
  message: string
  /** 추가 className */
  className?: string
  /** 한 줄 최대 글자 수 (기본값 50자) */
  maxCharsPerLine?: number
}

/** 문자열을 조건에 따라 자동 줄바꿈 처리 */
function formatMessage(text: string, maxChars: number): string {
  // 1️⃣ "세요" 다음에 줄바꿈 삽입
  const processed = text.replace(/세요/g, "세요\n")

  // 2️⃣ 50자 단위 자동 줄바꿈
  const result: string[] = []
  let buffer = ""

  for (const char of processed) {
    buffer += char
    if (buffer.length >= maxChars || char === "\n") {
      result.push(buffer.trimEnd())
      buffer = ""
    }
  }
  if (buffer.length > 0) result.push(buffer.trimEnd())

  return result.join("\n")
}

export default function TooltipCustomed({
  message,
  className,
  maxCharsPerLine = 50
}: TooltipCustomedProps) {
  const formattedMessage = formatMessage(message, maxCharsPerLine)

  return (
    <div
      className={cn(
        "relative w-fit max-w-[600px] rounded-md bg-zinc-800 px-5 py-3 text-sm text-white leading-relaxed shadow-md break-words",
        className
      )}
    >
      {/* 꼬리 부분 */}
      <div className="absolute -left-2 top-3 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-zinc-800" />

      {/* 내용 */}
      <p className="whitespace-pre-line">{formattedMessage}</p>
    </div>
  )
}
