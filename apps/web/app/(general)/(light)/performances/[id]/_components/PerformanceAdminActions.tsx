"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Edit3, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { DeleteConfirmDialog } from "@/app/(admin)/_components/data-table/DeleteConfirmDialog"
import {
  AdminPerformanceForm,
  PerformanceFormDialog,
  toPerformancePayload
} from "@/app/(admin)/admin/performances/_components/PerformanceFormDialog"
import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import {
  useDeletePerformance,
  useUpdatePerformance
} from "@/hooks/api/usePerformance"
import { useAuth } from "@/lib/providers/auth-provider"
import { Performance } from "@repo/shared-types"

const PerformanceAdminActions = ({
  performance
}: {
  performance: Performance
}) => {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const updateMutation = useUpdatePerformance()
  const deleteMutation = useDeletePerformance()

  if (!user?.isAdmin) return null

  const handleSubmit = (data: AdminPerformanceForm) => {
    updateMutation
      .mutateAsync([performance.id, toPerformancePayload(data)])
      .then(() => {
        toast({ title: "공연이 수정되었습니다." })
        queryClient.invalidateQueries({ queryKey: ["performances"] })
        queryClient.invalidateQueries({
          queryKey: ["performance", performance.id]
        })
        setFormOpen(false)
      })
      .catch((error) => {
        toast({
          title: "오류가 발생했습니다.",
          description: error.message,
          variant: "destructive"
        })
      })
  }

  const handleDelete = () => {
    deleteMutation
      .mutateAsync([performance.id])
      .then(() => {
        toast({ title: `${performance.name} 공연이 삭제되었습니다.` })
        queryClient.invalidateQueries({ queryKey: ["performances"] })
        router.push(ROUTES.PERFORMANCE.LIST)
      })
      .catch((error) => {
        toast({
          title: "삭제에 실패했습니다.",
          description: error.message,
          variant: "destructive"
        })
      })
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="rounded-full"
        onClick={() => setFormOpen(true)}
      >
        <Edit3 className="mr-2 size-4" />
        수정
      </Button>
      <Button
        variant="outline"
        className="rounded-full text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="mr-2 size-4" />
        삭제
      </Button>

      <PerformanceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        editingPerformance={performance}
        isPending={updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        description={`${performance.name} 공연을 삭제하시겠습니까? 소속 팀도 모두 삭제됩니다.`}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default PerformanceAdminActions
