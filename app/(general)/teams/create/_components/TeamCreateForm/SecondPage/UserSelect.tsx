import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"

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
import { User } from "@/types/User"

interface UserSelectProps {
  users: User[]
  form: UseFormReturn<any>
  fieldName: string
  fieldArrayIndex: number
}

const UserSelect = ({
  users,
  form,
  fieldName,
  fieldArrayIndex
}: UserSelectProps) => {
  const fieldNameWithIndex = `${fieldName}.${fieldArrayIndex}`
  const hasError = !!form.formState.errors[fieldNameWithIndex]

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[360px] justify-between",
            hasError && "border-destructive"
          )}
        >
          {value
            ? users.find((user) => user.id.toString() === value.split("-")[0])
                ?.name
            : "미정"}
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
                  onSelect={(currentValue) => {
                    const parsedValue = currentValue.split("-")[0]
                    form.setValue(fieldNameWithIndex, +parsedValue)
                    form.clearErrors("memberSessions")
                    setValue(parsedValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.id.toString() ? "opacity-100" : "opacity-0"
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
