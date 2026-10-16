export const REMINDER_EVENTS = {
  TEAM_RECRUITMENT_DEADLINE: "reminder.team_recruitment_deadline",
  ROOM_RESERVATION_SOON: "reminder.room_reservation_soon",
  EQUIPMENT_RETURN_DUE: "reminder.equipment_return_due"
} as const

export class TeamRecruitmentDeadlineEvent {
  constructor(readonly teamId: number) {}
}

export class RoomReservationSoonEvent {
  constructor(readonly rentalId: number) {}
}

export class EquipmentReturnDueEvent {
  constructor(readonly rentalId: number) {}
}
