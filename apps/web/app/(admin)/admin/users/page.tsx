"use client"

import { useMemo } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { useGenerations } from "@/hooks/api/useGeneration"
import { useSessions } from "@/hooks/api/useSession"
import { useUsers } from "@/hooks/api/useUser"
import { formatGenerationOrder } from "@/lib/utils"
import { getSessionDisplayName } from "@/constants/session"

import { getColumns } from "./_components/columns"

// TODO: 백엔드에 다음 API 추가 필요:
// - GET /users/admin (email, isAdmin, sessions 포함한 admin용 응답)
// - PATCH /users/:id (AdminGuard)
// - DELETE /users/:id (AdminGuard)
// 위 API 추가 후 UserFormDialog, 편집/삭제 기능 구현

export default function UsersAdminPage() {
  const { data: users, isLoading } = useUsers()
  const { data: generations } = useGenerations()
  const { data: sessions } = useSessions()

  const generationFilters = useMemo(
    () =>
      generations
        ?.sort((a, b) => b.order - a.order)
        .map((g) => ({
          label: `${formatGenerationOrder(g.order)}기`,
          value: String(g.order)
        })) ?? [],
    [generations]
  )

  const sessionFilters = useMemo(
    () =>
      sessions?.map((s) => ({
        label: getSessionDisplayName(s.name),
        value: s.name
      })) ?? [],
    [sessions]
  )

  const columns = useMemo(() => getColumns(), [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">회원 관리</h1>

      <DataTable
        columns={columns}
        data={users ?? []}
        isLoading={isLoading}
        initialSorting={[{ id: "id", desc: false }]}
        initialColumnVisibility={{ bio: false }}
        enableGlobalSearch
        searchPlaceholder="이름으로 검색..."
        emptyMessage="등록된 회원이 없습니다."
        filters={[
          {
            columnId: "generation",
            label: "기수",
            options: generationFilters
          },
          {
            columnId: "sessions",
            label: "세션",
            options: sessionFilters
          }
        ]}
      />
    </div>
  )
}
