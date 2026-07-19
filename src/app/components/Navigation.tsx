"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full bg-[#0b0f19]/60 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Project Assist
              </span>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-white/5 h-8 w-24 rounded-lg"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0b0f19]/60 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent hover:brightness-110 transition-all duration-300"
            >
              Project Assist
            </Link>
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/discovery"
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    pathname === "/discovery"
                      ? "bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.15)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  Discovery
                </Link>
                <Link
                  href="/dashboard"
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    pathname === "/dashboard"
                      ? "bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.15)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2.5">
                  {session?.user?.image ? (
                    <img
                      className="h-8 w-8 rounded-full border border-fuchsia-500/30 shadow-[0_0_8px_rgba(217,70,239,0.2)]"
                      src={session.user.image}
                      alt={session.user.name || "User"}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                      {((session?.user?.name || session?.user?.email || "U")[0]).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-slate-300">
                    {session?.user?.name || session?.user?.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="btn-primary px-5 py-2 text-sm font-semibold shadow-md rounded-lg flex items-center space-x-1"
              >
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
