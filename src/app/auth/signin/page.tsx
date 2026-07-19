"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect } from "react";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/discovery";
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = callbackUrl;
    }
  }, [isAuthenticated, callbackUrl]);

  const handleGoogleSignIn = () => signIn("google", { callbackUrl });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] px-4 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 p-10 glass-panel border border-white/5 relative z-10">
        <div className="text-center space-y-3">
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent text-glow">
            Project Assist
          </span>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight mt-4">
            Welcome to the Workspace
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            Sign in to start your collaborative discovery session
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleGoogleSignIn}
            className="group relative w-full flex justify-center items-center py-3.5 px-4 text-sm font-semibold rounded-xl btn-primary shadow-lg"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-4 text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </span>
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 font-medium">
            By signing in, you agree to our <span className="text-fuchsia-400/80 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-fuchsia-400/80 hover:underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
