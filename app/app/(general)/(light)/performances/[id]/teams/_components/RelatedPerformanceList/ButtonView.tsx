import Link from "next/link"

import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { cn } from "@/lib/utils"
import { Performance } from "@/types/Performance"

interface SelectViewProps {
  currentPerformanceId: number
  performanceOptions: Performance[]
}

const ButtonView = ({ currentPerformanceId, performanceOptions }: SelectViewProps) => {
  return (
    <div>
      <p className="mb-8 text-center font-bold">Performances</p>
      <div className="flex gap-x-4">
        {performanceOptions.map((p) => (
          <Link key={p.id} href={ROUTES.PERFORMANCE.TEAM.LIST(p.id)}>
            <Button
              className={cn(
                "rounded-xl bg-zinc-100 py-0 text-black shadow hover:bg-zinc-200",
                +currentPerformanceId === p.id &&
                  "border-2 border-primary font-extrabold text-primary"
              )}
            >
              {p.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ButtonView
