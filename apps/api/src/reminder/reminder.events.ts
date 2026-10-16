export const REMINDER_EVENTS = {
  TEAM_RECRUITMENT_DEADLINE: "reminder.team_recruitment_deadline"
} as const

export class TeamRecruitmentDeadlineEvent {
  constructor(readonly teamId: number) {}
}
