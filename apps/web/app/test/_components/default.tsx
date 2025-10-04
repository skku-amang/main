import { cn } from "@/lib/utils"

interface Props {
  className?: string
}

export default function Default({ className }: Props) {
  return <div className={cn(className)}></div>
}
