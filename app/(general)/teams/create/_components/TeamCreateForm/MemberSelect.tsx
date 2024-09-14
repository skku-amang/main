import { Check, ChevronsUpDown } from "lucide-react"
import React, { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

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
import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { cn } from "@/lib/utils"
import { User } from "@/types/User"

import CheckboxField from "./CheckboxField"

interface MemberSelectProps {
  form: UseFormReturn<z.infer<any>>
  memberSessionFieldName: string
}

const MemberSelect = ({ form, memberSessionFieldName }: MemberSelectProps) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [users, setMembers] = useState<User[]>([])

  useEffect(() => {
    fetchData(API_ENDPOINTS.USER.LIST)
      .then((data) => {
        console.log(data)
        return data.json()
      })
      .then((users) => {
        console.log(users)
        return setMembers(users)
      })
  }, [])

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
            className="w-[360px] justify-between"
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
                      setValue(currentValue === value ? "" : currentValue)
                      console.log(`${memberSessionFieldName}.memberId`)
                      console.log(currentValue)
                      form.setValue(
                        `memberSessions.${memberSessionFieldName}.memberId`,
                        +currentValue
                      )
                      console.log(form.getValues())
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
