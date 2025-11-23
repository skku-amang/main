import { PrismaClient } from "@repo/database"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

const prisma = new PrismaClient()
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
  }
})
