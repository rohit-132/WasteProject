"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface UserData {
  email: string;
  name: string;
  picture: string;
}

interface AuthResponse {
  message: string;
  user: UserData;
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          console.error("Authentication error:", error);
          router.push("/login?error=auth_failed");
          return;
        }

        if (!code) {
          console.error("No authorization code received");
          router.push("/login?error=no_code");
          return;
        }

        // Send the authorization code to your backend
        const response = await fetch(
          "http://127.0.0.1:8000/api/auth/google/callback",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to authenticate");
        }

        const data: AuthResponse = await response.json();

        // Store user data in localStorage
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("authMessage", data.message);

        // Redirect to home page with success message
        router.push("/?success=true");
      } catch (error) {
        console.error("Error during authentication:", error);
        router.push("/login?error=auth_failed");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#e8f5e9] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4"
      >
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#2e7d32] animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800">
            Completing Authentication
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your credentials...
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#e8f5e9] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4"
          >
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#2e7d32] animate-spin" />
              <h2 className="text-xl font-semibold text-gray-800">
                Loading...
              </h2>
              <p className="text-gray-600">Please wait...</p>
            </div>
          </motion.div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
