import { getUpdates, toUpdatePreview } from "@/lib/updates"

import HomeDashboard from "./_components/HomeDashboard"

export default function Home() {
  return (
    <HomeDashboard updates={getUpdates().slice(0, 3).map(toUpdatePreview)} />
  )
}
