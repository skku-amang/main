import { Check, ChevronsUpDown } from "lucide-react"
import React, { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { memberSessionSchema } from "@/app/(general)/teams/create/_components/TeamCreateForm/schema"
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

import CheckboxField from "./CheckboxField"

interface MemberSelectProps {
  form: UseFormReturn<z.infer<typeof memberSessionSchema>>
  memberSessionFieldName: string
  users: User[]
}

const MemberSelect = ({
  form,
  memberSessionFieldName,
  users
}: MemberSelectProps) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (form.formState.errors.memberSessions) {
      return setHasError(true)
    }
    if (
      form.formState.errors.memberSessions &&
      Object.hasOwn(
        form.formState.errors.memberSessions,
        memberSessionFieldName
      )
    ) {
      return setHasError(true)
    }
  }, [form.formState.errors.memberSessions, memberSessionFieldName])

  return (
    <div className="flex items-center gap-x-3">
      <CheckboxField
        form={form}
        memberSessionFieldName={memberSessionFieldName}
        label={memberSessionFieldName}
      />

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
              ? users.find((user) => user.id.toString() === value)?.name
              : "유저 선택"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0">
          <Command>
            <CommandInput placeholder="유저 검색" />
            <CommandList>
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id.toString()}
                    onSelect={(currentValue) => {
                      if (!currentValue) {
                        form.setValue(
                          `memberSessions.${memberSessionFieldName}.memberId` as any,
                          undefined
                        )
                        setValue("")
                      } else {
                        setValue(currentValue === value ? "" : currentValue)
                        form.setValue(
                          `memberSessions.${memberSessionFieldName}.memberId` as any,
                          +currentValue
                        )
                      }
                      form.clearErrors("memberSessions")
                      setHasError(false)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.id.toString()
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
    </div>
  )
}

export default MemberSelect
