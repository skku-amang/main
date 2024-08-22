import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import SimpleLabel from "./SimpleLabel"
import SimpleDescription from "./SimpleDescription"

interface Prop {
  form: any
  name: string
  label: string
  description?: string
  required?: boolean
  acceptedImageTypes?: string[]
}

const SimpleImageField = ({ form, name, label, description, required, acceptedImageTypes }: Prop) => {
  acceptedImageTypes = acceptedImageTypes ?? ["image/jpeg", "image/jpg", "image/png", "image/webp"]

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { value, onChange, ...fieldProps} }) => (
        <FormItem>
          <SimpleLabel required={required}>{label}</SimpleLabel>

          <FormControl>
            <Input
              type="file"
              {...fieldProps}
              accept={acceptedImageTypes.join(",")}
              onChange={(event) =>
                onChange(event.target.files && event.target.files[0])
              }
              className="hover:cursor-pointer"
              style={{ marginTop: '0.2rem' }} />
          </FormControl>

          <SimpleDescription>{description}</SimpleDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default SimpleImageField