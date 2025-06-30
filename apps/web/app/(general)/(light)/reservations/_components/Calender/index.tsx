"use client"
import "./CalenderStyle.css"

import dayGridPlugin from "@fullcalendar/daygrid"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"

import { fakePlan } from "@/app/(general)/(light)/reservations/_components/Calender/fakePlan"

export default function Calendar() {
  const eventColors = ["#E0F2FE", "#FEE2E2", "#FFEDD5"]
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]} // 사용할 플러그인 추가
      initialView="dayGridMonth" // 기본 뷰 설정
      headerToolbar={{
        left: "timeGridWeek,dayGridMonth",
        center: "prev title next  ",
        right: ""
      }}
      eventTimeFormat={{
        hour: "2-digit",
        minute: "2-digit",
        meridiem: false // true로 설정하면 AM/PM 표시
      }}
      slotMinTime={"07:00:00"}
      slotMaxTime={"24:00:00"}
      eventMinHeight={15}
      allDaySlot={false}
      eventDidMount={(info) => {
        const randomColor =
          eventColors[Math.floor(Math.random() * eventColors.length)]
        info.el.style.backgroundColor = randomColor
      }}
      events={fakePlan}
    />
  )
}
