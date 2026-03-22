import { Suspense } from "react"
import EquipmentListPage from "./_components/EquipmentListPage"

export default function Page() {
  return (
    <Suspense>
      <EquipmentListPage />
    </Suspense>
  )
}
