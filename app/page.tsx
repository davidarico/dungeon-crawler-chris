"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RootPage() {
  const router = useRouter();
  const { status } = useSession();

  // Redirect based on authentication status
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Redirect to the home component in the protected folder
      router.push("/home");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    </div>
  );
}
