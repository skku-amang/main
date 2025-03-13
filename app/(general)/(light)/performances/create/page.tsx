import { Home } from "lucide-react"

import DefaultPageHeader from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"

import PerformanceForm from "../_components/PerformanceForm"

const PerformanceCreate = () => {
  return (
    <div>
      <DefaultPageHeader
        title="공연 생성"
        routes={[
          {
            display: (
              <Home className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.67} />
            ),
            href: ROUTES.HOME
          },
          { display: "아카이브" },
          { display: "공연 생성", href: ROUTES.PERFORMANCE.LIST }
        ]}
      />

      <PerformanceForm />
    </div>
  )
}

export default PerformanceCreate
