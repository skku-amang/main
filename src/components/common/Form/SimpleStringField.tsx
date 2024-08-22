import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SimpleLabel from "./SimpleLabel";
import SimpleDescription from "./SimpleDescription";

interface Prop {
  form: any
  name: string
  label: string
  placeholder?: string
  description?: string
  required?: boolean
}

const SimpleStringField = ({ form, name, label, placeholder, description, required }: Prop) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field: { value, ...fieldProps} }) => (
      <FormItem>
        <SimpleLabel required={required}>{label}</SimpleLabel>

        <FormControl>
          <Input placeholder={placeholder} {...fieldProps} style={{ marginTop: '0.2rem' }} />
        </FormControl>

        <SimpleDescription>{description}</SimpleDescription>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default SimpleStringField
