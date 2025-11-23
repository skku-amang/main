import { auth } from "@/auth"
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    adminClient(), // https://www.better-auth.com/docs/plugins/admin#add-the-client-plugin
    inferAdditionalFields<typeof auth>()
  ]
})
