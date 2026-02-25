"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import * as React from "react"

import { FilterValue } from "@/app/(general)/(light)/performances/[id]/teams/_components/TeamListTable/filter"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const MobileFilterCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "data-[state=checked]:1 peer h-[18px] w-[18px] shrink-0 rounded border border-slate-300 ring-offset-background hover:shadow-checkbox focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-sky-500 data-[state=checked]:bg-sky-500 data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
MobileFilterCheckbox.displayName = CheckboxPrimitive.Root.displayName

interface MobileProps {
  className?: string
  header: string
  filterValues: FilterValue[]
}

const MobileFilter = ({ className, header, filterValues }: MobileProps) => {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center gap-x-3">
        <div className="text-sm font-semibold text-neutral-700">{header}</div>
      </div>

      <div className="grid grid-cols-3 gap-x-5 gap-y-3">
        {filterValues.map((v) => (
          <div
            key={v.label}
            className="flex items-center justify-start gap-x-3"
          >
            <MobileFilterCheckbox
              id={`filter-${v.label}`}
              name={v.label}
              value={v.label}
              checked={v.checked}
              onCheckedChange={(checked) => v.onChecked(!!checked)}
            />
            <Label
              htmlFor={`filter-${v.label}`}
              className="text-sm text-gray-900"
            >
              {v.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MobileFilter
