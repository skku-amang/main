export const USER_EVENTS = {
  SIGNED_UP: "user.signed_up",
  APPROVED: "user.approved"
} as const

export class UserSignedUpEvent {
  constructor(readonly userId: number) {}
}

export class UserApprovedEvent {
  constructor(readonly userId: number) {}
}
