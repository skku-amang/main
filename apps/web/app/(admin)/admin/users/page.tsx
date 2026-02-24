"use client"

import { useMemo } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { useUsers } from "@/hooks/api/useUser"

import { getColumns } from "./_components/columns"

// TODO: 백엔드에 다음 API 추가 필요:
// - GET /users/admin (email, isAdmin, sessions 포함한 admin용 응답)
// - PATCH /users/:id (AdminGuard)
// - DELETE /users/:id (AdminGuard)
// 위 API 추가 후 UserFormDialog, 편집/삭제 기능 구현

export default function UsersAdminPage() {
  const { data: users, isLoading } = useUsers()

  const columns = useMemo(() => getColumns(), [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">회원 관리</h1>

      <DataTable
        columns={columns}
        data={users ?? []}
        isLoading={isLoading}
        searchColumn="name"
        searchPlaceholder="이름으로 검색..."
        emptyMessage="등록된 회원이 없습니다."
      />
    </div>
  )
}
