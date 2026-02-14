"use client"

import { EquipCategory } from "@repo/database"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

const FILTER_CATEGORIES: { value: EquipCategory; label: string }[] = [
  { value: EquipCategory.GUITAR, label: "기타" },
  { value: EquipCategory.MICROPHONE, label: "마이크" },
  { value: EquipCategory.MIXER, label: "믹서" },
  { value: EquipCategory.BASS, label: "베이스" },
  { value: EquipCategory.SPEAKER, label: "스피커" },
  { value: EquipCategory.SYNTHESIZER, label: "신디" },
  { value: EquipCategory.AUDIO_INTERFACE, label: "오인페" },
  { value: EquipCategory.AMPLIFIER, label: "앰프" },
  { value: EquipCategory.DRUM, label: "드럼" },
  { value: EquipCategory.CABLE, label: "케이블" },
  { value: EquipCategory.ETC, label: "그 외" }
]

interface FilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCategories: EquipCategory[]
  onCategoriesChange: (categories: EquipCategory[]) => void
}

export default function FilterModal({
  open,
  onOpenChange,
  selectedCategories,
  onCategoriesChange
}: FilterModalProps) {
  const allSelected = selectedCategories.length === FILTER_CATEGORIES.length

  const toggleCategory = (category: EquipCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category))
    } else {
      onCategoriesChange([...selectedCategories, category])
    }
  }

  const selectAll = () => {
    onCategoriesChange(FILTER_CATEGORIES.map((c) => c.value))
  }

  const reset = () => {
    onCategoriesChange(FILTER_CATEGORIES.map((c) => c.value))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-bold">Filter</DialogTitle>
            <button
              onClick={reset}
              className="text-sm text-primary hover:underline"
            >
              초기화
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold">물품 분류</span>
            <button
              onClick={selectAll}
              className="text-sm text-primary hover:underline"
            >
              모두 선택
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {FILTER_CATEGORIES.map(({ value, label }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-1.5"
              >
                <Checkbox
                  checked={selectedCategories.includes(value)}
                  onCheckedChange={() => toggleCategory(value)}
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { FILTER_CATEGORIES }
