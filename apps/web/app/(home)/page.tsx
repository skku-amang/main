import { getUpdates } from "@/lib/updates"

import HomeDashboard from "./_components/HomeDashboard"

export default function Home() {
  const updates = getUpdates()
    .slice(0, 3)
    .map(({ slug, title, date, href, summary }) => ({
      slug,
      title,
      date,
      href,
      summary
    }))
  return <HomeDashboard updates={updates} />
}
