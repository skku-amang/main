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
    <label
      className={cn(
        "flex items-center gap-3 cursor-pointer select-none",
        className
      )}
    >
      <Checkbox
        className="size-[18px]
          data-[state=unchecked]:border-neutral-400
          data-[state=unchecked]:border-2
          data-[state=checked]:border-0
          data-[state=checked]:bg-third"
      />

      <span className="text-neutral-700 text-lg font-normal">{label}</span>
    </label>
  )
}
