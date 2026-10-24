import { RentalDetail } from "@repo/shared-types"

/** 블록·목록에 보일 사람 — 예약자 이름 + 나머지 인원 (users 순서는 예약자와 무관) */
export function getRentalPeopleLabel(
  rental: Pick<RentalDetail, "renter" | "users">
) {
  const renter = rental.renter ?? rental.users[0]
  if (!renter) return ""
  const others = rental.users.filter((u) => u.id !== renter.id).length
  return others > 0 ? `${renter.name} 외 ${others}명` : renter.name
}
