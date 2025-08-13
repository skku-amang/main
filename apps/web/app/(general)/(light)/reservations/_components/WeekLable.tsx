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
}

export default function WeekLabel({
  setCurrentMonday,
  weekLabel,
  setCalendarViewMonth,
  currentMonday,
  calendarViewMonth,
  monthLabel,
  daysInCalendar
}: WeekLabelProps) {
  return (
    <div className="absolute flex gap-5 items-center text-gray-700 font-semibold text-xl right-1/2 translate-x-1/2 -top-[62px]">
      <ChevronLeft
        className="cursor-pointer"
        onClick={() => setCurrentMonday((prev) => prev.subtract(1, "week"))}
      />
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
      <ChevronRight
        className="cursor-pointer"
        onClick={() => setCurrentMonday((prev) => prev.add(1, "week"))}
      />
    </div>
  )
}
