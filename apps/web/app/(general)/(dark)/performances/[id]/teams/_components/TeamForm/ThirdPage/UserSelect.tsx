import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form"

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
import { cn, formatGenerationOrder } from "@/lib/utils"

interface SelectableUser {
  id: number
  name: string
  nickname: string
  image: string | null
  generation: { order: number }
}

interface UserSelectProps<T extends FieldValues> {
  users: SelectableUser[]
  form: UseFormReturn<T>
  fieldName: string
  size?: "default" | "small"
}

function getNestedError(
  errors: Record<string, unknown>,
  path: string
): unknown {
  return path.split(".").reduce<unknown>((obj, key) => {
    if (obj && typeof obj === "object") {
      return (obj as Record<string, unknown>)[key]
    }
    return undefined
  }, errors)
}

const UserSelect = <T extends FieldValues>({
  users,
  form,
  fieldName,
  size = "default"
}: UserSelectProps<T>) => {
  const hasError = !!getNestedError(
    form.formState.errors as Record<string, unknown>,
    fieldName
  )

  const [open, setOpen] = useState(false)
  const watchedUserId = form.watch(fieldName as Path<T>) as
    | number
    | null
    | undefined
  const selectedUser = users.find((user) => user.id === watchedUserId)

  const isSmall = size === "small"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between",
            isSmall ? "h-8 w-full text-xs" : "w-52 md:w-[360px]",
            hasError && "border-destructive"
          )}
        >
          {selectedUser
            ? `${formatGenerationOrder(selectedUser.generation.order)}기 ${selectedUser.name}`
            : "Select"}
          <ChevronsUpDown
            className={cn(
              "shrink-0 opacity-50",
              isSmall ? "ml-1 h-3 w-3" : "ml-2 h-4 w-4"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", isSmall ? "w-52" : "w-[360px]")}>
        <Command>
          <CommandInput placeholder="유저 검색" />
          <CommandList>
            <CommandEmpty>결과 없음</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.id}-${user.name}`}
                  onSelect={() => {
                    form.setValue(
                      fieldName as Path<T>,
                      user.id as PathValue<T, Path<T>>
                    )
                    form.clearErrors(fieldName as Path<T>)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      watchedUserId === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div
                    className={cn(
                      "flex items-center",
                      isSmall ? "gap-x-2" : "gap-x-5"
                    )}
                  >
                    <Avatar className={isSmall ? "h-6 w-6" : undefined}>
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback
                        className={isSmall ? "text-xs" : undefined}
                      >
                        {user.name.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={isSmall ? "text-xs" : undefined}>
                      {formatGenerationOrder(user.generation.order)}기{" "}
                      {user.name}
                      {!isSmall && (
                        <span className="text-xs">
                          <br />#{user.nickname}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default UserSelect
