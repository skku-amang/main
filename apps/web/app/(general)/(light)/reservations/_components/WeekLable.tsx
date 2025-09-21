import {
  DropdownMenu,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight } from "lucide-react"
import SmallCalendar from "./SmallCalendar"
import { Dayjs } from "dayjs"

interface WeekLabelProps {
  setCurrentMonday: React.Dispatch<React.SetStateAction<Dayjs>>
  weekLabel: string
  setCalendarViewMonth: React.Dispatch<React.SetStateAction<Dayjs>>
  currentMonday: Dayjs
  calendarViewMonth: Dayjs
  monthLabel: string
  daysInCalendar: Dayjs[]
  mode: string
  className?: string
}

export default function WeekLabel({
  setCurrentMonday,
  weekLabel,
  setCalendarViewMonth,
  currentMonday,
  calendarViewMonth,
  monthLabel,
  daysInCalendar,
  mode,
  className
}: WeekLabelProps) {
  return (
    <div
      className={`absolute flex gap-5 items-center text-gray-700 font-semibold text-xl right-1/2 translate-x-1/2 -top-[62px] ${className}`}
    >
      <ChevronLeft
        className="cursor-pointer"
        onClick={() =>
          setCurrentMonday((prev) =>
            mode === "week"
              ? prev.subtract(1, "week")
              : prev.subtract(1, "month")
          )
        }
      />
      {mode === "week" ? (
        <DropdownMenu>
          <DropdownMenuTrigger>{weekLabel}</DropdownMenuTrigger>
          <SmallCalendar
            setCalendarViewMonth={setCalendarViewMonth}
            setCurrentMonday={setCurrentMonday}
            currentMonday={currentMonday}
            calendarViewMonth={calendarViewMonth}
            monthLabel={monthLabel}
            daysInCalendar={daysInCalendar}
          />
        </DropdownMenu>
      ) : (
        <span className="text-nowrap">{monthLabel}</span>
      )}
      <ChevronRight
        className="cursor-pointer"
        onClick={() =>
          setCurrentMonday((prev) =>
            mode === "week" ? prev.add(1, "week") : prev.add(1, "month")
          )
        }
      />
    </div>
  )
}
