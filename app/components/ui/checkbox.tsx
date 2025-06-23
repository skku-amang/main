"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import * as React from "react"

import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "data-[state=checked]:1 peer h-4 w-4 shrink-0 rounded-sm border border-slate-400 ring-offset-background hover:shadow-checkbox focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-sky-700 data-[state=checked]:bg-sky-700 data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4 font-extrabold" strokeWidth={4} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
