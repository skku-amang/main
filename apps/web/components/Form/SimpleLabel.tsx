import React from "react"

import { cn } from "../../lib/utils"
import { FormLabel } from "../ui/form"

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
    className={cn("text-slate-900 text-xs md:text-sm", className)}
    htmlFor={htmlFor}
  >
    {children} {required && <span className="text-destructive">*</span>}
  </FormLabel>
)

export default SimpleLabel
