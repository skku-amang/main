import { DatePicker } from "@/components/ui/datetimePicker";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import SimpleLabel from "./SimpleLabel";
import SimpleDescription from "./SimpleDescription";

interface Prop {
  form: any
  name: string
  label: string
  description?: string
  required?: boolean
}

const SimpleDateField = ({ form, name, label, description, required }: Prop) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <SimpleLabel className="me-3" required={required}>{label}</SimpleLabel>

        <FormControl>
          <DatePicker field={field} />
        </FormControl>

        <SimpleDescription>{description}</SimpleDescription>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default SimpleDateField