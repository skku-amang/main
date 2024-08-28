import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      authorize: async (credentials) => {
        console.log('credentials', credentials)
        let user = null

        // logic to verify if the user exists
        user = { email: credentials.email as string, image: 'https://example.com/image.jpg' }

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
    signIn: '/signin',
    newUser: '/signup',
    signOut: '/signout',
    error: '/error'
  }
})
