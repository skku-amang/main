import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import z from "zod"

import { memberSessionRequiredBaseSchema } from "@/app/(general)/teams/_components/TeamForm/SecondPage/schema"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export interface CheckboxFieldProps {
  secondPageForm: UseFormReturn<z.infer<typeof memberSessionRequiredBaseSchema>>
  fieldName: string
  label: string
}

const MemberSessionRequiredCheckbox = ({
  secondPageForm,
  fieldName,
  label
}: CheckboxFieldProps) => {
  const requiredFieldName = `${fieldName}.required` as any
  const memberFieldName = `${fieldName}.member` as any
  const [checked, setChecked] = useState<boolean>(
    secondPageForm.getValues(requiredFieldName)
  )

  return (
    <div className="flex items-center gap-x-2">
      <Checkbox
        id={requiredFieldName}
        className="h-5 w-5"
        onCheckedChange={(e) => {
          secondPageForm.setValue(requiredFieldName, !!e)
          secondPageForm.setValue(memberFieldName, null)
          setChecked(!!e)
        }}
        checked={checked}
      />
      <Label htmlFor={requiredFieldName} className="w-32 font-semibold">
        {label}
      </Label>
    </div>
  )
}

export default MemberSessionRequiredCheckbox
