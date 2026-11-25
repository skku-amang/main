import { Metadata } from "next"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import UpdateList from "@/components/updates/UpdateList"
import ROUTES from "@/constants/routes"
import { getUpdates, toUpdatePreview } from "@/lib/updates"

export const metadata: Metadata = {
  title: "업데이트 소식"
}

export default function UpdatesPage() {
  return (
    <div>
      <DefaultPageHeader
        title="업데이트 소식"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "업데이트 소식" }
        ]}
      />
      <div className="mx-auto max-w-2xl pb-12">
        <UpdateList updates={getUpdates().map(toUpdatePreview)} />
      </div>
    </div>
  )
}
