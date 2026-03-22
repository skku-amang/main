import { Suspense } from "react"
import ClubroomReservationPage from "./_components/ClubroomReservationPage"

export default function Page() {
  return (
    <Suspense>
      <ClubroomReservationPage />
    </Suspense>
  )
}
