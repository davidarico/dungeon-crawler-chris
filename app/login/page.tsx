"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa"; // You may need to install react-icons

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Dungeon Crawler Chris</CardTitle>
          <CardDescription>
            Sign in to continue to your adventure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {!isLoading ? (
              <>
                <FaGoogle className="h-4 w-4" />
                Sign in with Google
              </>
            ) : (
              "Signing in..."
            )}
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
}