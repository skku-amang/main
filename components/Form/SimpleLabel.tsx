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
  <FormLabel className={cn("font-bold", className)} htmlFor={htmlFor}>
    {children} {required && <span className="text-destructive">*</span>}
  </FormLabel>
)

export default SimpleLabel
