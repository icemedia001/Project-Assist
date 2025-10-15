"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Navigation from "@/app/components/Navigation";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[color:var(--muted)]">Loading Project Assist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            From idea to clarity
            <span className="block mt-2 bg-gradient-to-r from-[var(--accent)] to-[#e91e63] bg-clip-text text-transparent">
              guided by AI-powered discovery
            </span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-[color:var(--muted)] leading-relaxed">
            Transform your concepts into actionable insights through structured brainstorming techniques and intelligent AI agents that guide your creative process.
          </p>
          
          <div className="mt-12 flex justify-center animate-slide-up">
            {isAuthenticated ? (
              <Link
                href="/discovery"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg btn-primary btn-ripple hover-lift"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Discovery Session
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg btn-primary btn-ripple hover-lift"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Get Started
              </Link>
            )}
          </div>
        </div>

        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flow-root surface px-6 pb-8 card-hover">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-4 rounded-xl shadow-lg bg-gradient-to-br from-[#2a2133] to-[#1a1a2e]" style={{ color: "#ff1a88" }}>
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight">AI-Powered Ideation</h3>
                  <p className="mt-4 text-base text-[color:var(--muted)] leading-relaxed">
                    Leverage advanced AI techniques to generate creative ideas and solutions for complex problems through intelligent brainstorming.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flow-root surface px-6 pb-8 card-hover">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-4 rounded-xl shadow-lg bg-gradient-to-br from-[#2a2133] to-[#1a1a2e]" style={{ color: "#ff1a88" }}>
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight">Structured Discovery</h3>
                  <p className="mt-4 text-base text-[color:var(--muted)] leading-relaxed">
                    Follow proven discovery methodologies with guided techniques like SCAMPER, Six Thinking Hats, and mind mapping.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flow-root surface px-6 pb-8 card-hover">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-4 rounded-xl shadow-lg bg-gradient-to-br from-[#2a2133] to-[#1a1a2e]" style={{ color: "#ff1a88" }}>
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight">Actionable Insights</h3>
                  <p className="mt-4 text-base text-[color:var(--muted)] leading-relaxed">
                    Get comprehensive reports with prioritized recommendations, feasibility analysis, and clear next steps for implementation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
