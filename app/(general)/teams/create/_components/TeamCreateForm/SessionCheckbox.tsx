import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

interface CheckboxFieldProps {
  form: UseFormReturn<z.infer<typeof teamCreateFormSchema>>
  fieldName: keyof z.infer<typeof teamCreateFormSchema>
}

const CheckboxField = ({ form, fieldName }: CheckboxFieldProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox {...form.register(fieldName)} />
      <Label htmlFor={fieldName}>{fieldName}</Label>
    </div>
  )
}

export default CheckboxField
