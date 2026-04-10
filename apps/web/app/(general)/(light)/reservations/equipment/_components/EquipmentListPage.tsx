"use client"

import { useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { EquipCategory } from "@repo/database/enums"
import { Equipment } from "@repo/shared-types"
import { Filter, Plus, RefreshCw, PackageSearch } from "lucide-react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
  parseAsStringLiteral
} from "nuqs"

import Search from "@/components/Search"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import { useEquipments, useDeleteEquipment } from "@/hooks/api/useEquipment"
import { useToast } from "@/components/hooks/use-toast"

import EquipmentCard from "./EquipmentCard"
import FilterContent, { FILTER_CATEGORIES } from "./FilterModal"
import EquipmentFormModal from "./EquipmentFormModal"

const ITEMS_PER_PAGE = 9
const categoryValues = FILTER_CATEGORIES.map((c) => c.value)

export default function EquipmentListPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin ?? false
  const { data: equipments, isLoading, isError, error } = useEquipments("item")
  const deleteEquipment = useDeleteEquipment()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Delete optimistic feedback
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Search & Filter & Page — URL query state
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""))
  const [selectedCategories, setSelectedCategories] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsStringLiteral(categoryValues)).withDefault(
      categoryValues
    )
  )
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))

  // Equipment form modal state
  const [formOpen, setFormOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  )

  // Client-side filtering + sorting (brand+model 알파벳순)
  const filtered = useMemo(() => {
    if (!equipments) return []
    return equipments
      .filter((eq) => {
        const matchesCategory = selectedCategories.includes(
          eq.category as EquipCategory
        )
        const matchesSearch =
          search === "" ||
          `${eq.brand} ${eq.model} ${eq.description ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
        return matchesCategory && matchesSearch
      })
      .sort(
        (a, b) =>
          a.category.localeCompare(b.category) ||
          a.brand.localeCompare(b.brand) ||
          a.model.localeCompare(b.model)
      )
  }, [equipments, selectedCategories, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment)
    setFormOpen(true)
  }

  const handleDelete = (equipment: Equipment) => {
    if (
      !confirm(
        `"${equipment.brand} ${equipment.model}" 장비를 삭제하시겠습니까?`
      )
    )
      return
    setDeletingId(equipment.id)
    deleteEquipment.mutate([equipment.id], {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["equipments"] })
        setDeletingId(null)
      },
      onError: (err) => {
        setDeletingId(null)
        toast({
          variant: "destructive",
          title: "장비 삭제 실패",
          description:
            err instanceof Error
              ? err.message
              : "알 수 없는 오류가 발생했습니다."
        })
      }
    })
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingEquipment(null)
  }

  return (
    <div className="bg-neutral-50 -mx-6 px-6 md:-mx-0 md:px-0">
      <DefaultPageHeader
        title="장비 대여"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "예약" },
          { display: "장비 대여" }
        ]}
      />

      {/* Desktop toolbar */}
      <div className="mb-6 hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-2">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter size={16} />
                &nbsp;필터
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[480px] rounded-[12px] p-0"
            >
              <FilterContent
                onClose={() => setFilterOpen(false)}
                selectedCategories={selectedCategories}
                onCategoriesChange={(categories) => {
                  setSelectedCategories(categories)
                  setPage(1)
                }}
              />
            </PopoverContent>
          </Popover>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingEquipment(null)
                setFormOpen(true)
              }}
            >
              <Plus size={16} />
              &nbsp;장비 추가
            </Button>
          )}
        </div>
        <Search
          placeholder="검색"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value || null)
            setPage(1)
          }}
          className="max-w-sm"
        />
      </div>

      {/* Mobile toolbar */}
      <div className="mb-4 space-y-3 md:hidden">
        <div className="flex items-center gap-x-3">
          {/* 검색 */}
          <Search
            placeholder="검색"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value || null)
              setPage(1)
            }}
            className="h-9 min-w-0 flex-1 border-gray-200 drop-shadow-search"
          />

          {/* 필터 — TODO: mobile drawer filter (currently desktop-only popover) */}

          {/* 생성 */}
          {isAdmin && (
            <Button
              variant="outline"
              className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-slate-50 p-2 drop-shadow-search"
              onClick={() => {
                setEditingEquipment(null)
                setFormOpen(true)
              }}
            >
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Equipment Grid */}
      {isError ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-destructive">
            장비 목록을 불러오지 못했습니다:{" "}
            {error instanceof Error ? error.message : "알 수 없는 오류"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["equipments"] })
            }
          >
            <RefreshCw size={16} />
            &nbsp;다시 시도
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton className="mb-4 h-24 w-full rounded-md" />
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="mb-2 h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-muted-foreground">
          {search || selectedCategories.length < FILTER_CATEGORIES.length ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            <>
              <PackageSearch size={48} strokeWidth={1.5} />
              <p>등록된 장비가 없습니다.</p>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingEquipment(null)
                    setFormOpen(true)
                  }}
                >
                  <Plus size={16} />
                  &nbsp;장비 추가
                </Button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paged.map((eq) => (
            <div
              key={eq.id}
              className={
                deletingId === eq.id
                  ? "opacity-50 pointer-events-none"
                  : undefined
              }
            >
              <EquipmentCard
                equipment={eq}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Desktop Pagination — numbered buttons */}
      {totalPages > 1 && (
        <div className="mt-8 hidden items-center justify-center gap-1 sm:flex">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => setPage(1)}
          >
            <ChevronsLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => setPage(Math.max(1, currentPage - 1))}
          >
            <ChevronLeft size={16} />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (p === 1 || p === totalPages) return true
              return Math.abs(p - currentPage) <= 2
            })
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] ?? 0) > 1) acc.push("...")
              acc.push(p)
              return acc
            }, [])
            .map((item, i) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-1 text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === currentPage ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8 text-sm"
                  onClick={() => setPage(item)}
                >
                  {item}
                </Button>
              )
            )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === totalPages}
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === totalPages}
            onClick={() => setPage(totalPages)}
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      )}

      {/* Mobile Pagination — simple "< Page X of Y >" */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => setPage(Math.max(1, currentPage - 1))}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page&nbsp;&nbsp;{currentPage}&nbsp;&nbsp;of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === totalPages}
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Modals */}
      <EquipmentFormModal
        key={editingEquipment?.id ?? "new"}
        open={formOpen}
        onOpenChange={handleFormClose}
        equipment={editingEquipment}
      />
    </div>
  )
}
