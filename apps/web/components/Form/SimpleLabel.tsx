import React from "react"

import { FormLabel } from "../../../../packages/ui/src/form"
import { cn } from "../../lib/utils"

interface Prop {
  children: React.ReactNode
  className?: string
  required?: boolean
  htmlFor?: string
}

const SimpleLabel: React.FC<Prop> = ({
  children,
  className,
  required,
  htmlFor
}) => (
  <FormLabel
    className={cn("text-xs text-slate-900 md:text-sm", className)}
    htmlFor={htmlFor}
  >
    {children} {required && <span className="text-destructive">*</span>}
  </FormLabel>
)

export default SimpleLabel
