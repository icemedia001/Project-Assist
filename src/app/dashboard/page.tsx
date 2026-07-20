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

const PHASES = ["setup", "brainstorming", "prioritization", "architecture", "validation"];

export default function Dashboard() {
  const { isAuthenticated, isLoading, session } = useAuth(true);
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
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
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
    switch (phase?.toLowerCase()) {
      case "setup": return "bg-blue-500/10 text-blue-400 border-blue-500/25";
      case "brainstorming": return "bg-purple-500/10 text-purple-400 border-purple-500/25";
      case "prioritization":
      case "planning":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      case "architecture": return "bg-orange-500/10 text-orange-400 border-orange-500/25";
      case "validation": return "bg-pink-500/10 text-pink-400 border-pink-500/25";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/25";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-blue-500/10 text-blue-400 border-blue-500/20";
  };

  // Stepper helper
  const getPhaseStepIndex = (phaseName: string) => {
    const norm = phaseName?.toLowerCase();
    if (norm === "planning") return 2; // map planning to prioritization
    return PHASES.indexOf(norm);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-10 animate-fade-in">
          {/* Header Dashboard section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent text-glow">
                Dashboard Overview
              </h1>
              <p className="text-slate-400 text-sm font-medium">
                Workspace controller for {session?.user?.name || session?.user?.email}
              </p>
            </div>
            
            <Link
              href="/discovery"
              className="btn-primary flex items-center px-6 py-3 text-sm font-bold shadow-md rounded-xl justify-center w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Launch New Session</span>
            </Link>
          </div>

          {/* Stats Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total sessions */}
            <div className="glass-panel p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="flex items-center">
                <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/25">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4 space-y-0.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sessions</p>
                  <p className="text-2xl font-bold text-slate-200">{stats.totalSessions}</p>
                </div>
              </div>
            </div>

            {/* Active sessions */}
            <div className="glass-panel p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="flex items-center">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4 space-y-0.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Sessions</p>
                  <p className="text-2xl font-bold text-slate-200">{stats.activeSessions}</p>
                </div>
              </div>
            </div>

            {/* Total ideas */}
            <div className="glass-panel p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors"></div>
              <div className="flex items-center">
                <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/25">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="ml-4 space-y-0.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Ideas</p>
                  <p className="text-2xl font-bold text-slate-200">{stats.totalIdeas}</p>
                </div>
              </div>
            </div>

            {/* Completed sessions */}
            <div className="glass-panel p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
              <div className="flex items-center">
                <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4 space-y-0.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Sessions</p>
                  <p className="text-2xl font-bold text-slate-200">{stats.completedSessions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions List card panel */}
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold text-slate-200">Creative History</h2>
              
              {/* Filter Tabs layout */}
              <div className="flex bg-slate-950/40 p-1.5 rounded-xl border border-white/5 self-start">
                {(["all", "active", "completed"] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      filter === filterType
                        ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-sm"
                        : "text-slate-500 hover:text-slate-350 border border-transparent"
                    }`}
                  >
                    {filterType}
                  </button>
                ))}
              </div>
            </div>

            {sessionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="loading-skeleton h-28 rounded-xl"></div>
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-16 space-y-6 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto bg-slate-950/40 rounded-full flex items-center justify-center border border-white/5">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-350">No sessions match your filter</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Initiate a workspace with a command to begin tracking design metrics here.
                  </p>
                </div>
                <Link
                  href="/discovery"
                  className="btn-primary inline-flex items-center px-6 py-3 text-xs font-bold rounded-xl shadow-md"
                >
                  Start A Session
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredSessions.map((item) => {
                  const currentStepIdx = getPhaseStepIndex(item.currentPhase);
                  return (
                    <div 
                      key={item.id} 
                      className="border border-white/5 rounded-xl p-5 sm:p-6 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-200 group-hover:text-fuchsia-400 transition-colors">
                              {item.title || "Untitled Discovery Session"}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getPhaseColor(item.currentPhase)}`}>
                              {item.currentPhase}
                            </span>
                          </div>
                          
                          {item.problemStatement && (
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                              {item.problemStatement}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-5 text-[11px] text-slate-500 font-semibold pt-1">
                            <span className="flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60"></span>
                              <span>{item.ideasCount} Ideas</span>
                            </span>
                            <span className="flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60"></span>
                              <span>{item.clustersCount} Clusters</span>
                            </span>
                            <span className="flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500/60"></span>
                              <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                            </span>
                          </div>

                          {/* Stepper Progress bar visual */}
                          {item.status === "active" && (
                            <div className="pt-3 hidden sm:block">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                <span>Collaborative Journey</span>
                                <span>Step {Math.max(0, currentStepIdx) + 1} of 5</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {PHASES.map((phName, idx) => {
                                  const isActive = idx === currentStepIdx;
                                  const isCompleted = idx < currentStepIdx;
                                  return (
                                    <div key={phName} className="flex-1 flex flex-col space-y-1">
                                      <div className={`h-1.5 rounded-full transition-all duration-300 ${
                                        isActive 
                                          ? "bg-fuchsia-500 shadow-[0_0_8px_#d946ef]" 
                                          : isCompleted 
                                          ? "bg-slate-700" 
                                          : "bg-white/[0.04]"
                                      }`}></div>
                                      <span className={`text-[9px] font-bold capitalize text-center truncate ${
                                        isActive ? "text-fuchsia-400" : "text-slate-600"
                                      }`}>
                                        {phName}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="self-end md:self-start flex space-x-2 shrink-0">
                          {item.status === "active" ? (
                            <Link
                              href={`/discovery?session=${item.id}`}
                              className="btn-primary px-5 py-2 text-xs font-bold rounded-lg shadow-sm"
                            >
                              Resume
                            </Link>
                          ) : (
                            <Link
                              href={`/discovery?session=${item.id}`}
                              className="btn-secondary px-5 py-2 text-xs font-bold rounded-lg"
                            >
                              Review
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}