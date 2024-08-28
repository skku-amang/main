import { FormControl, FormField, FormItem, FormMessage } from "../../ui/form"
import { Input } from "../../ui/input"

import SimpleDescription from "./SimpleDescription"
import SimpleLabel from "./SimpleLabel"

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
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
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