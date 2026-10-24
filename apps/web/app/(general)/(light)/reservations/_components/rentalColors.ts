/** Figma 기반 파스텔 톤 이벤트 색상 팔레트 + 내 예약용 진한 색 (흰 글자 대비 4.5:1 이상) */
const RENTAL_COLORS = [
  {
    bg: "bg-blue-100",
    border: "border-blue-400",
    text: "text-blue-700",
    hoverBg: "hover:bg-blue-200",
    solid: {
      bg: "bg-blue-600",
      border: "border-blue-800",
      hoverBg: "hover:bg-blue-700"
    }
  },
  {
    bg: "bg-rose-100",
    border: "border-rose-400",
    text: "text-rose-700",
    hoverBg: "hover:bg-rose-200",
    solid: {
      bg: "bg-rose-600",
      border: "border-rose-800",
      hoverBg: "hover:bg-rose-700"
    }
  },
  {
    bg: "bg-amber-100",
    border: "border-amber-400",
    text: "text-amber-700",
    hoverBg: "hover:bg-amber-200",
    solid: {
      bg: "bg-amber-700",
      border: "border-amber-900",
      hoverBg: "hover:bg-amber-800"
    }
  },
  {
    bg: "bg-emerald-100",
    border: "border-emerald-400",
    text: "text-emerald-700",
    hoverBg: "hover:bg-emerald-200",
    solid: {
      bg: "bg-emerald-700",
      border: "border-emerald-900",
      hoverBg: "hover:bg-emerald-800"
    }
  },
  {
    bg: "bg-violet-100",
    border: "border-violet-400",
    text: "text-violet-700",
    hoverBg: "hover:bg-violet-200",
    solid: {
      bg: "bg-violet-600",
      border: "border-violet-800",
      hoverBg: "hover:bg-violet-700"
    }
  },
  {
    bg: "bg-cyan-100",
    border: "border-cyan-400",
    text: "text-cyan-700",
    hoverBg: "hover:bg-cyan-200",
    solid: {
      bg: "bg-cyan-700",
      border: "border-cyan-900",
      hoverBg: "hover:bg-cyan-800"
    }
  },
  {
    bg: "bg-orange-100",
    border: "border-orange-400",
    text: "text-orange-700",
    hoverBg: "hover:bg-orange-200",
    solid: {
      bg: "bg-orange-700",
      border: "border-orange-900",
      hoverBg: "hover:bg-orange-800"
    }
  },
  {
    bg: "bg-pink-100",
    border: "border-pink-400",
    text: "text-pink-700",
    hoverBg: "hover:bg-pink-200",
    solid: {
      bg: "bg-pink-600",
      border: "border-pink-800",
      hoverBg: "hover:bg-pink-700"
    }
  }
] as const

/** rental.id를 해시해서 일관된 색상 반환 — 내 예약은 같은 계열의 진한 색 + 흰 글자 */
export function getRentalColor(rentalId: number, mine = false) {
  const color = RENTAL_COLORS[rentalId % RENTAL_COLORS.length]!
  if (!mine) return color
  return { ...color.solid, text: "text-white" }
}
