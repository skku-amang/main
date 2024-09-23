import { Input } from "@/app/(general)/signup/_components/input"
import SimpleDescription from "@/components/Form/SimpleDescription"
import SimpleLabel from "@/components/Form/SimpleLabel"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"

interface Prop {
  form: any
  name: string
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  inputType?: "text" | "password" | "email" | "number" | "url" | "tel" | "date"
}

const SimpleStringField = ({
  form,
  name,
  label,
  placeholder,
  description,
  required,
  inputType
}: Prop) => (
  <FormField
    control={form.control}
    name={name}
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    render={({ field: { value, ...fieldProps } }) => (
      <FormItem>
        <SimpleLabel required={required}>{label}</SimpleLabel>

        <FormControl>
          <Input
            placeholder={placeholder}
            {...fieldProps}
            style={{ marginTop: "0.2rem"}}
            type={inputType}
            className="h-11 shadow-sm border-slate-300 focus:border-blue-500"
          />
        </FormControl>

        <SimpleDescription>{description}</SimpleDescription>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default SimpleStringField
