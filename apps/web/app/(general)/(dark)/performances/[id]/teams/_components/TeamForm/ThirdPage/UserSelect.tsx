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
import { cn } from "@/lib/utils"

interface SelectableUser {
  id: number
  name: string
  nickname: string
}

interface UserSelectProps<T extends FieldValues> {
  users: SelectableUser[]
  form: UseFormReturn<T>
  fieldName: string
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
  fieldName
}: UserSelectProps<T>) => {
  const hasError = !!getNestedError(
    form.formState.errors as Record<string, unknown>,
    fieldName
  )
  const initialUserId = form.getValues(fieldName as Path<T>) as
    | number
    | undefined

  const [open, setOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    initialUserId
  )

  const selectedUser = users.find((user) => user.id === selectedUserId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-52 justify-between md:w-[360px]",
            hasError && "border-destructive"
          )}
        >
          {selectedUser?.name ?? "미정"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0">
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
                    setSelectedUserId(user.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUserId === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-x-5">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>
                        {user.name.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      {user.name}
                      <span className="text-xs">
                        <br /># {user.nickname}
                      </span>
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
