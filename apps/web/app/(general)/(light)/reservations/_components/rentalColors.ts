/** Figma 기반 파스텔 톤 이벤트 색상 팔레트 */
const RENTAL_COLORS = [
  {
    bg: "bg-blue-100",
    border: "border-blue-400",
    text: "text-blue-700",
    hoverBg: "hover:bg-blue-200"
  },
  {
    bg: "bg-rose-100",
    border: "border-rose-400",
    text: "text-rose-700",
    hoverBg: "hover:bg-rose-200"
  },
  {
    bg: "bg-amber-100",
    border: "border-amber-400",
    text: "text-amber-700",
    hoverBg: "hover:bg-amber-200"
  },
  {
    bg: "bg-emerald-100",
    border: "border-emerald-400",
    text: "text-emerald-700",
    hoverBg: "hover:bg-emerald-200"
  },
  {
    bg: "bg-violet-100",
    border: "border-violet-400",
    text: "text-violet-700",
    hoverBg: "hover:bg-violet-200"
  },
  {
    bg: "bg-cyan-100",
    border: "border-cyan-400",
    text: "text-cyan-700",
    hoverBg: "hover:bg-cyan-200"
  },
  {
    bg: "bg-orange-100",
    border: "border-orange-400",
    text: "text-orange-700",
    hoverBg: "hover:bg-orange-200"
  },
  {
    bg: "bg-pink-100",
    border: "border-pink-400",
    text: "text-pink-700",
    hoverBg: "hover:bg-pink-200"
  }
] as const

/** rental.id를 해시해서 일관된 색상 반환 */
export function getRentalColor(rentalId: number) {
  return RENTAL_COLORS[rentalId % RENTAL_COLORS.length]!
}
