"use client"

import { FeedbackProgress } from "@repo/shared-types"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/app/(admin)/_components/data-table/DataTableColumnHeader"
import { UserCell } from "@/app/(admin)/_components/data-table/UserCell"

import { ProgressBar, RemainingBadge } from "./ProgressBits"

type Person = FeedbackProgress["people"][number]
type Team = FeedbackProgress["teams"][number]

const MISSING_PREVIEW = 3

export const remainingOf = (p: Person) => p.required - p.done

export function getPeopleColumns(
  teamById: Map<number, Team>,
  teamLink: (teamId: number) => string
): ColumnDef<Person>[] {
  const teamNames = (ids: number[]) => ids.map((id) => teamById.get(id)?.name)
  const songNames = (ids: number[]) =>
    ids.map((id) => teamById.get(id)?.songName ?? "")

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="이름" />
      ),
      meta: { label: "이름" },
      cell: ({ row }) => <UserCell user={row.original} />,
      size: 140,
      enableHiding: false
    },
    {
      id: "teams",
      accessorFn: (p) => teamNames(p.teamIds).join(", "),
      header: () => <span className="whitespace-nowrap">소속 팀</span>,
      meta: { label: "소속 팀" },
      size: 260,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex max-w-72 flex-wrap gap-1">
          {row.original.teamIds.map((id) => (
            <Link
              key={id}
              href={teamLink(id)}
              className="max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-xs hover:underline"
            >
              {teamById.get(id)?.name}
            </Link>
          ))}
        </div>
      )
    },
    {
      id: "progress",
      // 정렬 기준 = 남은 곡 수
      accessorFn: remainingOf,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="진행" />
      ),
      meta: { label: "진행" },
      size: 120,
      cell: ({ row }) => (
        <div className="flex w-24 flex-col items-start gap-1.5">
          <ProgressBar
            done={row.original.done}
            total={row.original.required}
            label={`${row.original.name} 피드백 진행`}
            className="w-full"
          />
          <RemainingBadge count={remainingOf(row.original)} unit="곡" />
        </div>
      )
    },
    {
      id: "missing",
      accessorFn: (p) => songNames(p.missingTeamIds).join(", "),
      header: () => <span className="whitespace-nowrap">남은 곡</span>,
      meta: { label: "남은 곡" },
      size: 280,
      enableSorting: false,
      cell: ({ row }) => {
        const missing = songNames(row.original.missingTeamIds)
        if (missing.length === 0)
          return <span className="text-muted-foreground">-</span>
        return (
          <span className="text-muted-foreground" title={missing.join(", ")}>
            {missing.slice(0, MISSING_PREVIEW).join(", ")}
            {missing.length > MISSING_PREVIEW &&
              ` 외 ${missing.length - MISSING_PREVIEW}곡`}
          </span>
        )
      }
    }
  ]
}
