import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"

import PerformanceForm from "../_components/PerformanceForm"

const PerformanceCreate = () => {
  return (
    <div>
      <DefaultPageHeader
        title="공연 생성"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "아카이브" },
          { display: "공연 생성", href: ROUTES.PERFORMANCE.LIST }
        ]}
      />

      <PerformanceForm />
    </div>
  )
}

export default PerformanceCreate
