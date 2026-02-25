import { redirect } from "next/navigation"

import { auth } from "@/auth"
import ROUTES from "@/constants/routes"

import { AdminSidebar } from "./_components/AdminSidebar"
import { UnsavedChangesProvider } from "./_components/UnsavedChangesContext"

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    redirect(ROUTES.LOGIN)
  }

  return (
    <UnsavedChangesProvider>
      <div className="flex h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-neutral-50 p-6">
          {children}
        </main>
      </div>
    </UnsavedChangesProvider>
  )
}
