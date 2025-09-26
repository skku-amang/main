import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MobileReservationStatusCard from "./MobileReservationStatusCard"
import MobileMyReservationCard from "./MobileMyReservationCard"

export interface Reservation {
  start: string
  end: string
  user: string
  title: string
}

interface MobileMyReservationFieldProps {
  myReservation: Reservation[]
}

export default function MobileReservationField({
  myReservation
}: MobileMyReservationFieldProps) {
  return (
    <Tabs defaultValue="reservationStatus" className="w-full">
      <TabsList className="flex h-14 *:h-full *:text-md *:min-[400px]:text-lg bg-neutral-50 justify-center gap-3">
        <TabsTrigger
          value="reservationStatus"
          className="flex-1 data-[state=active]:bg-third rounded-xl data-[state=active]:text-white bg-white text-neutral-700"
        >
          예약 현황
        </TabsTrigger>
        <TabsTrigger
          value="myReservations"
          className="flex-1 data-[state=active]:bg-third rounded-xl data-[state=active]:text-white bg-white text-neutral-700"
        >
          나의 예약
        </TabsTrigger>
      </TabsList>
      <TabsContent value="reservationStatus" className="w-full">
        <MobileReservationStatusCard />
      </TabsContent>
      <TabsContent
        value="myReservations"
        className="w-full flex flex-col gap-3"
      >
        {myReservation.map((reservation, i) => (
          <MobileMyReservationCard key={i} reservation={reservation} />
        ))}
      </TabsContent>
    </Tabs>
  )
}
