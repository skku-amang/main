import { redirect } from "next/navigation"

import ROUTES from "@/constants/routes"

export default function AdminIndexPage() {
  redirect(ROUTES.ADMIN.USERS)
}
