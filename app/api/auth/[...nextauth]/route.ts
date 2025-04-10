import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Configure NextAuth
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      // Add user info to the session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

// Export handlers for API route
export { handler as GET, handler as POST };

// Export auth function for server-side authentication
export const auth = handler.auth;