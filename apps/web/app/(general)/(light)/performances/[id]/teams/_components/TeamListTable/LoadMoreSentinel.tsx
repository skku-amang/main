import { useEffect, useRef } from "react"

/** 목록 끝에 두는 빈 칸. 화면에 들어오면 onVisible — 더 불러온 뒤에도 보이면 다시 부른다 */
const LoadMoreSentinel = ({ onVisible }: { onVisible: () => void }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onVisible()
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onVisible])

  return <div ref={ref} aria-hidden className="h-px" />
}

export default LoadMoreSentinel
