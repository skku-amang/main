import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Button } from "@repo/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@repo/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover"
import { User } from "shared-types"

interface UserSelectProps {
  users: User[]
  form: any
  fieldName: string
}

const UserSelect = ({ users, form, fieldName }: UserSelectProps) => {
  const hasError = !!form.formState.errors[fieldName]
  let initialMemberIdWithName = ""
  const userId = form.getValues(fieldName)
  if (userId) {
    const userName = users.find((user) => user.id === userId)?.name
    initialMemberIdWithName = `${userId}-${userName}`
  }

  const [open, setOpen] = useState(false)
  const [memberIdWithName, setMemberIdWithName] = useState(
    initialMemberIdWithName
  ) // {id}-{name}

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
          {memberIdWithName
            ? users.find(
                (user) => user.id.toString() === memberIdWithName.split("-")[0]
              )?.name
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
                  onSelect={(currentValue: string) => {
                    const [userId, userName] = currentValue.split("-")
                    form.setValue(fieldName, +userId as any)
                    // const previousMembers = form.getValues(
                    //   fieldName
                    // ) as number[]
                    // console.log("fieldName:", fieldName)
                    // console.log("form:", form.getValues("보컬.membersId.0"))
                    // console.log("previousMembers:", previousMembers)
                    // const parsedValue = currentValue.split("-")[0]
                    // form.setValue(fieldName, [
                    //   ...previousMembers,
                    //   +parsedValue
                    // ])
                    form.clearErrors(fieldName)
                    setMemberIdWithName(`${userId}-${userName}`)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      memberIdWithName === user.id.toString()
                        ? "opacity-100"
                        : "opacity-0"
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
