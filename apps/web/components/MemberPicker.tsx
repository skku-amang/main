"use client"

import { ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { koreanCommandFilter } from "@/lib/hangul-search"
import { cn, formatGenerationOrder } from "@/lib/utils"

export interface PickableMember {
  id: number
  name: string
  generation: { order: number }
}

interface MemberPickerProps<T extends PickableMember> {
  /** 선택 후보 멤버 목록 */
  users: T[]
  /** 멤버를 선택했을 때 호출되는 콜백 (단건). 다중 선택은 호출자가 외부 state로 관리 */
  onSelect: (user: T) => void
  /** 후보에서 제외할 ID (이미 선택된 멤버 등). 지정하면 옵션 목록에서 숨김 */
  excludeIds?: number[]
  /** Trigger 버튼 placeholder. 기본값: "멤버 추가" */
  placeholder?: string
  /** Command 입력 placeholder. 기본값: "이름 또는 기수로 검색" */
  searchPlaceholder?: string
  /** Popover trigger 버튼 className 오버라이드 */
  className?: string
  /** 비활성화 */
  disabled?: boolean
}

/**
 * 한글 친화 검색 + 기수 표기를 지원하는 멤버 선택 컴포넌트.
 *
 * - cmdk `Command` + `koreanCommandFilter`로 영문/한글/초성 검색 모두 매칭
 * - 검색 대상은 `${name} ${generation}기` 합친 문자열 → 이름과 기수 모두 검색 가능
 * - 동명이인은 옵션과 트리거에서 기수로 구분 표기
 *
 * 다중 선택 패턴: `excludeIds`에 이미 선택된 멤버 ID를 넘기면 후보에서 빠진다.
 * 선택 시 popover가 닫히고 호출자가 `onSelect`에서 자체 state에 추가한다.
 */
export default function MemberPicker<T extends PickableMember>({
  users,
  onSelect,
  excludeIds = [],
  placeholder = "멤버 추가",
  searchPlaceholder = "이름 또는 기수로 검색",
  className,
  disabled
}: MemberPickerProps<T>) {
  const [open, setOpen] = useState(false)

  const availableUsers = users.filter((u) => !excludeIds.includes(u.id))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="text-muted-foreground">{placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command filter={koreanCommandFilter}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>일치하는 멤버가 없어요</CommandEmpty>
            <CommandGroup>
              {availableUsers.map((user) => {
                const generationLabel = `${formatGenerationOrder(user.generation.order)}기`
                // cmdk filter는 단일 string(value)만 받으므로, 이름과 기수를
                // 함께 합쳐 둘 다 검색 가능하게 한다. id 접두사는 동명이인
                // 동기수까지 같은 경우의 value 충돌을 방지한다.
                const searchValue = `${user.id} ${user.name} ${generationLabel}`
                return (
                  <CommandItem
                    key={user.id}
                    value={searchValue}
                    onSelect={() => {
                      onSelect(user)
                      setOpen(false)
                    }}
                  >
                    <span className="flex-1 truncate">{user.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {generationLabel}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
