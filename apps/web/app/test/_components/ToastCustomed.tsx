import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ToastCustomedProps {
  /** 성공(success) / 경고(alert) */
  variant: "success" | "alert"
  /** 제목 */
  title: string
  /** 설명 (선택사항) */
  description?: string
  /** 닫기 버튼 동작 */
  onClose?: () => void
  /** 추가 클래스 */
  className?: string
}

export default function ToastCustomed({
  variant,
  title,
  description,
  onClose,
  className
}: ToastCustomedProps) {
  const isSuccess = variant === "success"

  return (
    <div
      className={cn(
        "relative flex flex-col gap-[4px] w-[360px] p-6 rounded-lg shadow-[2px_5px_10px_rgba(0,0,0,0.1)] transition-all",
        isSuccess
          ? "bg-white border border-slate-200"
          : "bg-red-50 border border-red-100",
        className
      )}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className={cn(
          "absolute right-[9px] top-2 z-10 transition-colors",
          isSuccess
            ? "text-slate-800 hover:text-slate-600"
            : "text-destructive hover:text-red-600"
        )}
      >
        <X size={16} strokeWidth={1.5} />
      </button>

      {/* 제목 */}
      <p
        className={cn(
          "font-semibold text-sm",
          isSuccess ? "text-slate-900" : "text-destructive"
        )}
      >
        {title}
      </p>

      {/* 설명 */}
      {description && (
        <p
          className={cn(
            "text-sm font-normal",
            isSuccess ? "text-slate-800" : "text-destructive"
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
