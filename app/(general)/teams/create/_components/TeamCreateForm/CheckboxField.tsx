import { UseFormReturn } from "react-hook-form"
import z from "zod"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export interface CheckboxFieldProps {
  form: UseFormReturn<z.infer<any>>
  memberSessionFieldName: string
  label: string
}

const CheckboxField = ({
  form,
  memberSessionFieldName,
  label
}: CheckboxFieldProps) => {
  return (
    <div className="flex items-center gap-x-2">
      <Checkbox
        className="h-5 w-5"
        onCheckedChange={(e) => {
          form.setValue(memberSessionFieldName as any, !!e.valueOf() as any)
        }}
        value={form.getValues(memberSessionFieldName)}
      />
      <Label htmlFor={memberSessionFieldName}>{label}</Label>
    </div>
  )
}

export default CheckboxField
