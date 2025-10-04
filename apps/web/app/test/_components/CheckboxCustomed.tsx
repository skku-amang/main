import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface CheckboxCustomedProps {
  className?: string
  label?: string
}

export default function CheckboxCustomed({
  className,
  label
}: CheckboxCustomedProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Checkbox className="size-[18px] data-[state=unchecked]:border-neutral-400 data-[state=unchecked]:border-2 data-[state=checked]:border-0 data-[state=checked]:bg-third" />
      <span className="justify-start text-Neutral-700 text-lg font-normal ">
        {label}
      </span>
    </div>
  )
}
