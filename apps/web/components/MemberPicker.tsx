"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { cn } from "@/lib/utils"
import { formatGenerationOrder } from "@repo/shared-types"

export interface PickableMember {
  id: number
  name: string
  image?: string | null
  generation: { order: number }
}

interface BaseProps<T extends PickableMember> {
  /** 선택 후보 멤버 목록 */
  users: T[]
  /** 후보에서 제외할 ID (이미 선택된 멤버 등). 지정하면 옵션 목록에서 숨김 */
  excludeIds?: number[]
  /** Trigger 버튼 placeholder */
  placeholder?: string
  /** Command 입력 placeholder. 기본값: "이름 또는 기수로 검색" */
  searchPlaceholder?: string
  /** Popover trigger 버튼 className 오버라이드 */
  className?: string
  /** 비활성화 */
  disabled?: boolean
  /** Trigger 오류 표시 (폼 검증 실패) */
  invalid?: boolean
}

interface AddModeProps<T extends PickableMember> extends BaseProps<T> {
  mode?: "add"
  /** 멤버를 골랐을 때 호출 (단건). 다중 선택은 호출자가 외부 state로 관리 */
  onSelect: (user: T) => void
}

interface SingleModeProps<T extends PickableMember> extends BaseProps<T> {
  mode: "single"
  value: number | null
  onChange: (userId: number | null) => void
  /** 목록 맨 위에 '비워 두기'를 둬 선택을 해제할 수 있게 한다 */
  clearable?: boolean
}

type MemberPickerProps<T extends PickableMember> =
  AddModeProps<T> | SingleModeProps<T>

const generationLabel = (user: PickableMember) =>
  `${formatGenerationOrder(user.generation.order)}기`

function MemberAvatar({
  user,
  className
}: {
  user: PickableMember
  className?: string
}) {
  return (
    <Avatar className={cn("size-6", className)}>
      <AvatarImage src={user.image ?? undefined} alt="" />
      <AvatarFallback className="text-[10px]">{user.name[0]}</AvatarFallback>
    </Avatar>
  )
}

/**
 * 한글 친화 검색 + 기수 표기를 지원하는 멤버 선택 컴포넌트.
 *
 * - cmdk `Command` + `koreanCommandFilter`로 영문/한글/초성 검색 모두 매칭
 * - 검색 대상은 `${name} ${generation}기` 합친 문자열 → 이름과 기수 모두 검색 가능
 * - 동명이인은 옵션과 트리거에서 기수로 구분 표기
 *
 * `mode="add"`(기본): 고를 때마다 `onSelect`, 트리거는 항상 placeholder ("멤버 추가").
 * `excludeIds`에 이미 고른 멤버를 넘기면 후보에서 빠진다.
 * `mode="single"`: 한 명을 `value`로 들고, 트리거에 고른 멤버의 사진·기수·이름을 보여 준다.
 */
export default function MemberPicker<T extends PickableMember>(
  props: MemberPickerProps<T>
) {
  const {
    users,
    excludeIds = [],
    searchPlaceholder = "이름 또는 기수로 검색",
    className,
    disabled,
    invalid
  } = props
  const isSingle = props.mode === "single"
  const placeholder = props.placeholder ?? (isSingle ? "선택" : "멤버 추가")
  const [open, setOpen] = useState(false)

  const selected = isSingle
    ? users.find((u) => u.id === props.value)
    : undefined
  const availableUsers = users.filter((u) => !excludeIds.includes(u.id))

  const pick = (user: T | null) => {
    if (props.mode === "single") props.onChange(user?.id ?? null)
    else if (user) props.onSelect(user)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between gap-x-2 px-3 font-normal",
            invalid && "border-destructive",
            className
          )}
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-x-2">
              <MemberAvatar user={selected} />
              <span className="truncate">
                {generationLabel(selected)} {selected.name}
              </span>
            </span>
          ) : (
            <span className="truncate text-muted-foreground">
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
        align="start"
      >
        <Command filter={koreanCommandFilter}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>일치하는 멤버가 없어요</CommandEmpty>
            <CommandGroup>
              {isSingle && props.clearable && (
                <CommandItem value="__clear__" onSelect={() => pick(null)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      props.value === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-muted-foreground">
                    비워 두기 ({placeholder})
                  </span>
                </CommandItem>
              )}
              {availableUsers.map((user) => {
                // cmdk filter는 단일 string(value)만 받으므로, 이름과 기수를
                // 함께 합쳐 둘 다 검색 가능하게 한다. id 접두사는 동명이인
                // 동기수까지 같은 경우의 value 충돌을 방지한다.
                const searchValue = `${user.id} ${user.name} ${generationLabel(user)}`
                return (
                  <CommandItem
                    key={user.id}
                    value={searchValue}
                    onSelect={() => pick(user)}
                  >
                    {isSingle && (
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          props.value === user.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    )}
                    <MemberAvatar user={user} className="mr-2" />
                    <span className="flex-1 truncate">{user.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {generationLabel(user)}
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
