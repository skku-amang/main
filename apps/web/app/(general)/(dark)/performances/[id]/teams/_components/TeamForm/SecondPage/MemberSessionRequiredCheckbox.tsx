import { UseFormReturn } from "react-hook-form"
import z from "zod"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

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

  // watch를 사용하여 폼 값 변경을 실시간으로 반영
  const checked = secondPageForm.watch(requiredFieldName)

  return (
    <div className="flex items-center gap-x-2">
      {/* TODO: 내부 체크 SVG 크기 조정 */}
      <Checkbox
        id={requiredFieldName}
        className="h-3 w-3 md:h-5 md:w-5"
        onCheckedChange={(e) => {
          secondPageForm.setValue(requiredFieldName, !!e)
          secondPageForm.setValue(memberFieldName, null)
        }}
        checked={checked}
      />
      <Label htmlFor={requiredFieldName} className="text-xs md:text-sm md:w-32">
        {label}
      </Label>
    </div>
  )
}

export default MemberSessionRequiredCheckbox
