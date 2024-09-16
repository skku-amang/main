import { UseFormReturn } from "react-hook-form"
import z from "zod"

import { firstPageSchema } from "@/app/(general)/teams/create/_components/TeamCreateForm/schema"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export interface CheckboxFieldProps {
  firstPageForm: UseFormReturn<z.infer<typeof firstPageSchema>>
  fieldName: keyof z.infer<typeof firstPageSchema>
  label: string
}

const MemberSessionRequiredCheckbox = ({
  firstPageForm,
  fieldName,
  label
}: CheckboxFieldProps) => {
  if (!firstPageForm) return null
  const requiredFieldName = `${fieldName}.required` as any

  return (
    <div className="flex items-center gap-x-2">
      <Checkbox
        id={requiredFieldName}
        className="h-5 w-5"
        onCheckedChange={(e) => firstPageForm.setValue(requiredFieldName, !!e)}
        checked={firstPageForm.getValues(requiredFieldName) as boolean}
      />
      <Label htmlFor={requiredFieldName}>{label}</Label>
    </div>
  )
}

export default MemberSessionRequiredCheckbox
