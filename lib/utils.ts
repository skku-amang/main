import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * `order` 값을 처리하여 소수점 1자리를 포함하고, 그 값이 0인 경우 소수점을 떼고 반환합니다.
 * @param order - 처리할 `order` 값
 * @returns 처리된 `order` 값
 * @example formatGenerationOrder(1.0) // "1"
 */
export function formatGenerationOrder(order: number): string {
  return order % 1 === 0 ? `${Math.floor(order)}` : `${order}`;
}