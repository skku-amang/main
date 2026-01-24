"use client"

import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"
import MobileMonthBlock from "./MobileMonthBlock"

interface MobileCalendarSectionProps {
  currentMonday: Dayjs
}

export default function MobileCalendarSection({
  currentMonday
}: MobileCalendarSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())

  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    dayjs().startOf("isoWeek").add(index, "day").format("dd")
  )

  const monthStartDate = currentMonday.startOf("month")
  const calendarGridStartDate = monthStartDate.startOf("isoWeek")
  const calendarGridEndDate = monthStartDate.endOf("month").endOf("isoWeek")

  const calendarDates: Dayjs[] = []
  for (
    let date = calendarGridStartDate;
    date.isBefore(calendarGridEndDate) ||
    date.isSame(calendarGridEndDate, "day");
    date = date.add(1, "day")
  ) {
    calendarDates.push(date)
  }

  return (
    <div className="w-full h-auto px-2 relative flex flex-col mx-auto rounded-lg bg-white pt-16 pb-5">
      <div className="w-full flex">
        {weekdayLabels.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="flex-1 font-medium h-11 flex justify-center items-center text-base text-secondary"
          >
            {label}
          </div>
        ))}
      </div>

      <MobileMonthBlock
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        calendarDates={calendarDates}
        currentMonth={monthStartDate}
      />
    </div>
  )
}
