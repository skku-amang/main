import { Row } from "@tanstack/react-table"
import Link from "next/link"

import TeamBookmarkButton from "@/components/TeamBookmarkButton"
import ROUTES from "@/constants/routes"
import { RosterSlot } from "@/lib/team/roster"

import { TeamColumn } from "./columns"
import MemberChip from "./MemberChip"
import RosterCell from "./RosterCell"

/** 휴대폰 '표' 보기 — 팀 = 행, 세션 자리 = 열. 곡명 칸은 고정하고 가로로 밀어서 본다 */
const CompactTeamList = ({
  rows,
  slots
}: {
  rows: Row<TeamColumn>[]
  slots: RosterSlot[]
}) => (
  <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
    <table className="w-max min-w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-slate-100 text-xs text-slate-500">
          <th className="sticky left-0 z-10 bg-white py-2 pl-2 pr-3 font-medium">
            곡
          </th>
          <th className="px-2 py-2 font-medium">팀장</th>
          {slots.map((slot) => (
            <th
              key={`${slot.sessionName}-${slot.index}`}
              className="px-2 py-2 font-medium"
            >
              {slot.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map(({ original: team }) => (
          <tr key={team.id}>
            <td className="sticky left-0 z-10 max-w-[150px] bg-white py-2 pl-1 pr-3 shadow-[1px_0_0_0_rgb(241,245,249)]">
              <div className="flex items-center gap-1">
                <TeamBookmarkButton
                  teamId={team.id}
                  bookmarked={team.isBookmarked}
                  className="size-7 shrink-0"
                />
                <Link
                  href={ROUTES.PERFORMANCE.TEAM.DETAIL(
                    team.performanceId,
                    team.id
                  )}
                  className="min-w-0"
                >
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {team.songName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {team.songArtist}
                  </p>
                </Link>
              </div>
            </td>
            <td className="px-2 py-2">
              <MemberChip user={team.leader} />
            </td>
            {slots.map((slot) => (
              <td
                key={`${slot.sessionName}-${slot.index}`}
                className="px-2 py-2"
              >
                <RosterCell team={team} slot={slot} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default CompactTeamList
