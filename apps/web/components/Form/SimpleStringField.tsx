import { FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import SimpleDescription from "./SimpleDescription"
import SimpleLabel from "./SimpleLabel"

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
            style={{ marginTop: "0.2rem" }}
            type={inputType}
            className="border-slate-300 shadow-sm"
          />
        </FormControl>

        <SimpleDescription>{description}</SimpleDescription>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default SimpleStringField
