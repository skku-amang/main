import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TeamHeaderButton = (props: ButtonProps) => {
  const { children, className } = props

  return (
    <Button
      className={cn(
        "h-9 w-9 rounded-lg border border-gray-200 bg-slate-50 p-2 drop-shadow-search",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export default TeamHeaderButton
