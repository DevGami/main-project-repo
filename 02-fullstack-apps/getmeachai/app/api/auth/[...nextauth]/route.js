import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import connectDb from '@/db/connectDb'
import User from '@/models/User'
import Payment from '@/models/Payment'

export const authOptions = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Only handle OAuth providers (not credential-based)
      if (['github', 'google'].includes(account.provider)) {
        try {
          await connectDb()

          // FIX: was using `email` (undefined for OAuth) — must use `user.email`
          const currentUser = await User.findOne({ email: user.email })

          if (!currentUser) {
            // New user — create with email-based username (strip special chars)
            const baseUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
            await User.create({
              email: user.email,
              username: baseUsername,
              name: user.name || '',
              profilepic: user.image || '',
            })
          }
          return true
        } catch (error) {
          console.error('Error during signIn callback:', error)
          return false
        }
      }
      return true
    },

    async session({ session }) {
      try {
        await connectDb()
        const dbUser = await User.findOne({ email: session.user.email })
        if (dbUser) {
          // Store username in session.user.name so we can link to /{username}
          session.user.name = dbUser.username
        }
      } catch (error) {
        console.error('Error during session callback:', error)
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { authOptions as GET, authOptions as POST }