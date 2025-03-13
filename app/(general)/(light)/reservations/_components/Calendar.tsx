"use client"

import dayGridPlugin from "@fullcalendar/daygrid"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"

export default function Calendar() {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]} // 사용할 플러그인 추가
      initialView="dayGridMonth" // 기본 뷰 설정
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek"
      }}
      events={[
        { title: "회의", start: "2025-03-15" },
        { title: "프로젝트 마감", start: "2025-03-20" }
      ]}
    />
  )
}
