import { Suspense } from "react"
import EquipmentCalendarPage from "./_components/EquipmentCalendarPage"

export default function Page() {
  return (
    <Suspense>
      <EquipmentCalendarPage />
    </Suspense>
  )
}
