import { DatePicker } from "../../../../packages/ui/src/datetimePicker"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "../../../../packages/ui/src/form"
import SimpleDescription from "./SimpleDescription"
import SimpleLabel from "./SimpleLabel"

interface Prop {
  form: any
  name: string
  label: string
  description?: string
  required?: boolean
}

const SimpleDateField = ({
  form,
  name,
  label,
  description,
  required
}: Prop) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <SimpleLabel className="me-3" required={required}>
          {label}
        </SimpleLabel>

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
