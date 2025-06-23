"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import * as React from "react"

import { FilterValue } from "@/app/(general)/(light)/performances/[id]/teams/_components/TeamListTable/filter"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const DesktopFilterCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "data-[state=checked]:1 peer h-6 w-6 shrink-0 rounded-sm border border-slate-400 ring-offset-background hover:shadow-checkbox focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-sky-700 data-[state=checked]:bg-sky-700 data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-6 w-6 font-extrabold" strokeWidth={4} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
DesktopFilterCheckbox.displayName = CheckboxPrimitive.Root.displayName

interface DesktopFilterProps {
  className?: string
  header: string
  filterValues: FilterValue[]
}

const DesktopFilter = ({
  className,
  header,
  filterValues
}: DesktopFilterProps) => {
  return (
    <div className={className}>
      <div className="mb-6 text-lg text-primary">{header}</div>

      <div
        className={cn(
          "grid gap-4",
          filterValues.length > 4 ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        {filterValues.map((v) => (
          <div key={v.label} className="flex w-[184px] items-center gap-x-3">
            <DesktopFilterCheckbox
              id={`filter-${v.label}`}
              name={v.label}
              value={v.label}
              checked={v.checked}
              onCheckedChange={(checked) => v.onChecked(!!checked)}
            />
            <Label
              htmlFor={`filter-${v.label}`}
              className="text-nowrap text-gray-900"
            >
              {v.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DesktopFilter
