import { UseFormReturn } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
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

  return (
    <Select
      onValueChange={(value) => form.setValue(fieldNameWithIndex, +value)}
    >
      <SelectTrigger
        className={cn("w-[180px]", hasError && "border-destructive")}
      >
        <SelectValue placeholder="유저 선택" />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id.toString()}>
            {user.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default UserSelect
