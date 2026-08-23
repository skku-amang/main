import type { Metadata } from "next"
import { redirect } from "next/navigation"

import ROUTES from "@/constants/routes"
import { isPreviewDeployment } from "@/lib/auth/previewDeployment"
import { getServerUser } from "@/lib/auth/server"

import { AdminSidebar } from "./_components/AdminSidebar"
import { UnsavedChangesProvider } from "./_components/UnsavedChangesContext"

export const metadata: Metadata = {
  robots: { index: false, follow: false }
}

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()

  if (!isPreviewDeployment && !user?.isAdmin) {
    redirect(ROUTES.LOGIN)
  }

  return (
    <UnsavedChangesProvider>
      <div className="flex h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-neutral-50 p-6 pt-16 md:pt-6">
          {children}
        </main>
      </div>
    </UnsavedChangesProvider>
  )
}
