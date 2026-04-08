"use client"

import { EquipCategory } from "@repo/database/enums"

import {
  FilterItem,
  FilterPopoverContent,
  FilterSection
} from "@/components/FilterPopover"
import { Separator } from "@/components/ui/separator"

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

interface FilterContentProps {
  onClose: () => void
  selectedCategories: EquipCategory[]
  onCategoriesChange: (categories: EquipCategory[]) => void
}

export default function FilterContent({
  onClose,
  selectedCategories,
  onCategoriesChange
}: FilterContentProps) {
  const selectAll = () => {
    onCategoriesChange(FILTER_CATEGORIES.map((c) => c.value))
  }

  const items: FilterItem[] = FILTER_CATEGORIES.map(({ value, label }) => ({
    label,
    checked: selectedCategories.includes(value),
    onCheckedChange: (checked) => {
      if (checked) {
        onCategoriesChange([...selectedCategories, value])
      } else {
        onCategoriesChange(selectedCategories.filter((c) => c !== value))
      }
    }
  }))

  return (
    <FilterPopoverContent onReset={selectAll} onClose={onClose}>
      <FilterSection
        header="물품 분류"
        items={items}
        onSelectAll={selectAll}
        columns={4}
      />
    </FilterPopoverContent>
  )
}

export { FILTER_CATEGORIES }
