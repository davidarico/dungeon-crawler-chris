import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import HomePage from "../(protected)/page";

// Configure the auth options for consistency with the route handler
const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
};

export default async function ProtectedHomePage() {
  const session = await getServerSession(authOptions);
  
  // Server-side authentication check
  if (!session) {
    redirect("/login");
  }
  
  // Render the protected home page component
  return <HomePage />;
}