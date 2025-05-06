import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertUser } from "@/lib/db/user";
import { AuthOptions } from "next-auth";

// Define auth options to be used across the application
export const authOptions: AuthOptions = {
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
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email && user.id) {
        try {
          // Store user in database when they sign in
          await upsertUser({
            id: user.id,
            email: user.email,
            name: user.name || null,
            image: user.image || null,
          });
          return true;
        } catch (error) {
          console.error("Error saving user to database:", error);
          // Still allow sign in even if database storage fails
          return true;
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user info to the session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

// Create the NextAuth handler with our options
const handler = NextAuth(authOptions);

// Export handlers for API route
export { handler as GET, handler as POST };

// Export auth function for server-side authentication
export const auth = handler.auth;