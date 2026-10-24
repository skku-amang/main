import { RentalDetail } from "@repo/shared-types"

type RentalPeopleSource = Pick<RentalDetail, "renter" | "users">

/** 예약자와 나머지 인원 — users 순서는 예약자와 무관해서 users[0]을 쓰면 안 됨 */
export function getRentalPeople(rental: RentalPeopleSource) {
  const renter = rental.renter ?? rental.users[0]
  const others = renter
    ? rental.users.filter((u) => u.id !== renter.id).length
    : 0
  return { renter, others }
}

/** 내가 참여자로 들어간 예약 — 달력에서 테두리로 강조 */
export const isMyRental = (
  rental: Pick<RentalDetail, "users">,
  userId: number | undefined
) => userId !== undefined && rental.users.some((u) => u.id === userId)

/** 블록·목록에 보일 사람 — "예약자 외 N명" */
export function getRentalPeopleLabel(rental: RentalPeopleSource) {
  const { renter, others } = getRentalPeople(rental)
  if (!renter) return ""
  return others > 0 ? `${renter.name} 외 ${others}명` : renter.name
}
