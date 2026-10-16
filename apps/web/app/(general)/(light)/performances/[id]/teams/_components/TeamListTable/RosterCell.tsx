import { getRosterCell, RosterSlot } from "@/lib/team/roster"
import { TeamFromList } from "@/lib/team/teamSession"

import MemberChip from "./MemberChip"
import SlotActionButton from "./SlotActionButton"

/**
 * 세션 자리 한 칸: 맡은 사람 이름 / 모집 / 이 팀엔 없는 자리(–).
 * - canApply면 빈자리를 '지원' 버튼으로 (로그인 + 모집 중일 때)
 * - viewerId가 맡은 자리면 이름을 강조하고 아래에 '취소' 버튼 (서버가 모집 마감 후 취소도 허용)
 * - compact(휴대폰)면 사진·버튼 없이 이름과 '모집' 표시만
 */
const RosterCell = ({
  team,
  slot,
  canApply = false,
  viewerId,
  compact = false
}: {
  team: TeamFromList
  slot: RosterSlot
  canApply?: boolean
  viewerId?: number
  compact?: boolean
}) => {
  const cell = getRosterCell(team, slot)
  const actionProps = {
    teamId: team.id,
    songName: team.songName,
    index: slot.index,
    label: slot.label
  }

  if (cell.kind === "member") {
    const { user } = cell.member
    const isMe = viewerId !== undefined && user.id === viewerId
    return (
      <MemberChip user={user} showAvatar={!compact} isMe={isMe}>
        {isMe && !compact && (
          <SlotActionButton
            action="cancel"
            sessionId={cell.sessionId}
            {...actionProps}
          />
        )}
      </MemberChip>
    )
  }
  if (cell.kind === "open") {
    // 한 팀에서 같은 세션은 한 자리만 — 이미 기타1이면 기타2엔 지원 불가 (서버도 409)
    const alreadyInSession =
      viewerId !== undefined &&
      team.teamSessions
        .find((ts) => ts.session.id === cell.sessionId)
        ?.members.some((m) => m.user.id === viewerId)
    return canApply && !compact && !alreadyInSession ? (
      <SlotActionButton
        action="apply"
        sessionId={cell.sessionId}
        {...actionProps}
      />
    ) : (
      <span
        title={alreadyInSession ? "이미 이 세션에 지원했어요" : undefined}
        className="whitespace-nowrap rounded-[5px] bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
      >
        모집
      </span>
    )
  }
  return <span className="text-slate-300">–</span>
}

export default RosterCell
