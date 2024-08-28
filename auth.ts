import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import ROUTES from '@/constants/routes'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      authorize: async (credentials) => {
        let user = null

        // logic to verify if the user exists
        user = {
          email: credentials.email as string
        }

        if (!user) {
          // No user found, so this is their first attempt to login
          // meaning this is also the place you could do registration
          throw new Error('User not found.')
        }

        // return user object with their profile data
        return user
      }
    })
  ],
  pages: {
    signIn: ROUTES.LOGIN.url,
    newUser: ROUTES.SIGNUP.url,
    error: '/error'
  },
  callbacks: {
    redirect: async ({ url, baseUrl }) => {
      // URL에서 callbackUrl을 읽어 리다이렉트
      const urlParams = new URL(url)
      const callbackUrl = urlParams.searchParams.get('callbackUrl')
        ? baseUrl + urlParams.searchParams.get('callbackUrl')
        : baseUrl
      console.log('callbackUrl', callbackUrl)
      return callbackUrl
    },
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth
    }
  }
})
