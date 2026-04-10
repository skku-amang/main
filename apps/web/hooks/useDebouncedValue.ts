import { useEffect, useState } from "react"

/**
 * 값이 변경된 후 delay(ms)만큼 안정되면 debounced 값을 반환한다.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
