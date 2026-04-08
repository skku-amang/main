import { Check, Link } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import YoutubePlayer from "@/components/YoutubePlayer"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { isValidYoutubeUrl } from "@repo/shared-types"

interface YoutubeInputProps {
  defaultUrl?: string
  onConfirm: (url: string) => void
  /** 입력 필드 앞에 링크 아이콘 표시 (데스크톱 다이얼로그용) */
  showLinkIcon?: boolean
  playerClassName?: string
}

const YoutubeInput = ({
  defaultUrl = "",
  onConfirm,
  showLinkIcon,
  playerClassName
}: YoutubeInputProps) => {
  const [urlInput, setUrlInput] = useState(defaultUrl)
  const debouncedUrl = useDebouncedValue(urlInput, 500)

  const validation = useMemo(() => {
    if (!debouncedUrl) return { valid: true, error: null } as const
    if (isValidYoutubeUrl(debouncedUrl))
      return { valid: true, error: null } as const
    return {
      valid: false,
      error: "유효한 YouTube URL을 입력해주세요"
    } as const
  }, [debouncedUrl])

  // 아직 debounce 중인지 (입력값과 debounced 값이 다르면 평가 대기 중)
  const isPending = urlInput !== debouncedUrl

  return (
    <>
      <div className="flex items-center gap-x-2">
        <div className={cn("relative flex-1", showLinkIcon && "pl-0")}>
          {showLinkIcon && (
            <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className={cn(
              showLinkIcon && "pl-10",
              validation.error &&
                !isPending &&
                "border-destructive focus-visible:ring-destructive"
            )}
            placeholder="Enter URL"
          />
        </div>

        {/* 상태 표시 + 확인 버튼 */}
        {validation.valid && !isPending ? (
          <div className="flex items-center gap-x-2">
            {debouncedUrl && (
              <span className="flex items-center gap-x-1 text-sm text-emerald-600">
                <Check size={16} strokeWidth={3} />
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              className="border border-secondary text-sm text-secondary"
              onClick={() => onConfirm(debouncedUrl)}
            >
              확인
            </Button>
          </div>
        ) : validation.error && !isPending ? (
          <span className="shrink-0 text-sm text-destructive">Failed</span>
        ) : null}
      </div>

      {/* 에러 메시지 */}
      {validation.error && !isPending && (
        <div className="mt-1 text-xs text-destructive">{validation.error}</div>
      )}

      {/* 유튜브 프리뷰 */}
      {validation.valid && !isPending && (
        <YoutubePlayer
          videoUrl={debouncedUrl}
          className={cn("mt-3 w-full", playerClassName)}
          allowFullScreen
        />
      )}
    </>
  )
}

export default YoutubeInput
