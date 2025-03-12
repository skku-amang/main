import { cn } from "@/lib/utils"

interface TeamFormBackgroundProps {
  className?: string
}

const TeamFormBackground = ({ className }: TeamFormBackgroundProps) => {
  return (
    <div
      className={cn(
        "absolute top-0 z-[-1] h-[325px] w-full bg-primary drop-shadow-[2px_5px_10px_rgba(0,0,0,0.1)]",
        className
      )}
    />
  )
}

export default TeamFormBackground
