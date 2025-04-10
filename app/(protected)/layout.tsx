import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }
  
  return <>{children}</>;
}