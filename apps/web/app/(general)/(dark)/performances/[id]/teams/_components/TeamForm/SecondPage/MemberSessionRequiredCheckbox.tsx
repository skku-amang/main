import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import z from "zod"

import { Checkbox } from "@repo/ui/checkbox"
import { Label } from "@repo/ui/label"

import { memberSessionRequiredBaseSchema } from "./schema"

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
      {/* TODO: 내부 체크 SVG 크기 조정 */}
      <Checkbox
        id={requiredFieldName}
        className="h-3 w-3 md:h-5 md:w-5"
        onCheckedChange={(e) => {
          secondPageForm.setValue(requiredFieldName, !!e)
          secondPageForm.setValue(memberFieldName, null)
          setChecked(!!e)
        }}
        checked={checked}
      />
      <Label htmlFor={requiredFieldName} className="text-xs md:w-32 md:text-sm">
        {label}
      </Label>
    </div>
  )
}

export default MemberSessionRequiredCheckbox
