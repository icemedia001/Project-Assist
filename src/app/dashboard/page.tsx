"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Navigation from "@/app/components/Navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Session {
  id: string;
  title: string | null;
  problemStatement: string | null;
  status: string;
  currentPhase: string;
  createdAt: string;
  updatedAt: string;
  ideasCount: number;
  clustersCount: number;
}

export default function Dashboard() {
  const { isAuthenticated, isLoading, session } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated]);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredSessions = sessions.filter(session => {
    if (filter === "active") return session.status === "active";
    if (filter === "completed") return session.status === "completed";
    return true;
  });

  const stats = {
    totalSessions: sessions.length,
    activeSessions: sessions.filter(s => s.status === "active").length,
    totalIdeas: sessions.reduce((sum, s) => sum + s.ideasCount, 0),
    completedSessions: sessions.filter(s => s.status === "completed").length
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "setup": return "bg-blue-500/20 text-blue-300";
      case "brainstorming": return "bg-purple-500/20 text-purple-300";
      case "prioritization": return "bg-yellow-500/20 text-yellow-300";
      case "architecture": return "bg-green-500/20 text-green-300";
      case "validation": return "bg-red-500/20 text-red-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-500/20 text-green-300 border-green-500/30"
      : "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Dashboard
              </h1>
              <p className="text-[color:var(--muted)] text-lg">
                Welcome back, {session?.user?.name || session?.user?.email}
              </p>
            </div>
            <Link
              href="/discovery"
              className="btn-primary btn-ripple hover-lift inline-flex items-center px-6 py-3"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Session
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="surface p-6 card-hover">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500/20 text-blue-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-[color:var(--muted)]">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                </div>
              </div>
            </div>

            <div className="surface p-6 card-hover">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500/20 text-green-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-[color:var(--muted)]">Active Sessions</p>
                  <p className="text-2xl font-bold">{stats.activeSessions}</p>
                </div>
              </div>
            </div>

            <div className="surface p-6 card-hover">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500/20 text-purple-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-[color:var(--muted)]">Total Ideas</p>
                  <p className="text-2xl font-bold">{stats.totalIdeas}</p>
                </div>
              </div>
            </div>

            <div className="surface p-6 card-hover">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-500/20 text-yellow-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-[color:var(--muted)]">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedSessions}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="surface p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Session History</h2>
              <div className="flex space-x-2">
                {(["all", "active", "completed"] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterType
                        ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                        : "bg-[#1f2637] text-[color:var(--text)] hover:bg-[#222a3e]"
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {sessionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="loading-skeleton h-24 rounded-lg"></div>
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-[color:var(--muted)] text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
                <p className="text-[color:var(--muted)] mb-6">
                  Start your first discovery session to begin exploring ideas.
                </p>
                <Link
                  href="/discovery"
                  className="btn-primary btn-ripple hover-lift inline-flex items-center px-6 py-3"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Start Discovery Session
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="border border-[color:var(--border)] rounded-lg p-6 bg-[#1b2233] hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {session.title || "Untitled Session"}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(session.currentPhase)}`}>
                            {session.currentPhase}
                          </span>
                        </div>
                        
                        {session.problemStatement && (
                          <p className="text-[color:var(--muted)] mb-3 line-clamp-2">
                            {session.problemStatement}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-[color:var(--muted)]">
                          <span>💡 {session.ideasCount} ideas</span>
                          <span>🎯 {session.clustersCount} clusters</span>
                          <span>📅 {new Date(session.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex space-x-2">
                        {session.status === "active" ? (
                          <Link
                            href={`/discovery?session=${session.id}`}
                            className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-contrast)] rounded-lg text-sm font-medium hover:brightness-95 transition-colors"
                          >
                            Resume
                          </Link>
                        ) : (
                          <Link
                            href={`/discovery?session=${session.id}`}
                            className="px-4 py-2 bg-[#1f2637] text-[color:var(--text)] rounded-lg text-sm font-medium hover:bg-[#222a3e] transition-colors"
                          >
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}