import { Row } from "@tanstack/react-table"
import Link from "next/link"

import StatusBadge from "@/components/TeamBadges/StatusBadge"
import TeamBookmarkButton from "@/components/TeamBookmarkButton"
import ROUTES from "@/constants/routes"
import { isTeamSatisfied } from "@/lib/team/teamSession"

import { TeamColumn } from "./columns"

/** 휴대폰 '표' 보기 — 한 팀 한 줄 */
const CompactTeamList = ({ rows }: { rows: Row<TeamColumn>[] }) => (
  <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg bg-white shadow-sm">
    {rows.map(({ original: team }) => (
      <li key={team.id} className="flex items-center gap-2 py-2.5 pl-2 pr-3">
        <TeamBookmarkButton
          teamId={team.id}
          bookmarked={team.isBookmarked}
          className="shrink-0"
        />
        <Link
          href={ROUTES.PERFORMANCE.TEAM.DETAIL(team.performanceId, team.id)}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-700">
              {team.songName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {team.songArtist} · {team.leader.name}
            </p>
          </div>
          <StatusBadge
            status={isTeamSatisfied(team.teamSessions) ? "Inactive" : "Active"}
            className="shrink-0 text-xs"
          />
        </Link>
      </li>
    ))}
  </ul>
)

export default CompactTeamList
