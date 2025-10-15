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
      <nav className="backdrop-blur supports-[backdrop-filter]:bg-[#0f1422]/70 bg-[#0f1422] border-b border-[color:var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-[color:var(--text)]">
                Discovery System
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-[#1f2637] h-8 w-24 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="backdrop-blur supports-[backdrop-filter]:bg-[#0f1422]/70 bg-[#0f1422] border-b border-[color:var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-[color:var(--text)] hover:text-[var(--accent)] transition-colors">
              Discovery System
            </Link>
            {isAuthenticated && (
              <div className="ml-10 flex items-baseline space-x-2">
                <Link
                  href="/discovery"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    pathname === "/discovery"
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-lg"
                      : "text-[color:var(--text)]/70 hover:text-[color:var(--text)] hover:bg-[#1b2233] hover:shadow-md"
                  }`}
                >
                  Discovery
                </Link>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    pathname === "/dashboard"
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-lg"
                      : "text-[color:var(--text)]/70 hover:text-[color:var(--text)] hover:bg-[#1b2233] hover:shadow-md"
                  }`}
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {session?.user?.image && (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || "User"}
                    />
                  )}
                  <span className="text-sm font-medium text-[color:var(--text)]/80">
                    {session?.user?.name || session?.user?.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm text-[color:var(--text)]/70 hover:text-[color:var(--text)] transition-colors hover:bg-[#1b2233] px-3 py-2 rounded-md"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:brightness-95 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
