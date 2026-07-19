"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface SessionHistory {
  id: string;
  title: string;
  problemStatement: string;
  status: string;
  currentPhase: string;
  techniquesUsed: string[];
  createdAt: string;
  updatedAt: string;
  ideasCount: number;
  clustersCount: number;
}

interface SessionSidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onSessionDelete: (sessionId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function SessionSidebar({
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onSessionDelete,
  isOpen,
  onToggle,
}: SessionSidebarProps) {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/sessions");
      
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [session?.user?.id]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!session?.user?.id) return;
    
    setDeletingSessionId(sessionId);
    setShowDeleteConfirm(null);
    
    try {
      const response = await fetch(`/api/session/${sessionId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete session");
      }
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        onSessionDelete(sessionId);
      }
      
    } catch (err) {
      console.error("Failed to delete session:", err);
      setError(err instanceof Error ? err.message : "Failed to delete session");
    } finally {
      setDeletingSessionId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "paused":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase?.toLowerCase()) {
      case "brainstorming":
        return "bg-purple-500/15 border border-purple-500/35 text-purple-300";
      case "analysis":
        return "bg-blue-500/15 border border-blue-500/35 text-blue-300";
      case "planning":
        return "bg-emerald-500/15 border border-emerald-500/35 text-emerald-300";
      case "architecture":
        return "bg-orange-500/15 border border-orange-500/35 text-orange-300";
      case "validation":
        return "bg-pink-500/15 border border-pink-500/35 text-pink-300";
      default:
        return "bg-slate-500/15 border border-slate-500/35 text-slate-300";
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-[#0d1220]/90 backdrop-blur-xl border-r border-white/5 z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-base font-bold text-slate-200 tracking-tight">
            Sessions History
          </h3>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={fetchSessions}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh sessions"
            >
              <svg 
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors lg:hidden"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Session Button */}
        <div className="p-4 border-b border-white/5">
          <button
            onClick={onNewSession}
            className="btn-primary w-full py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Session</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto min-h-0 sidebar-container p-3 space-y-2">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-fuchsia-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-xs text-slate-400 font-medium">Loading history...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <div className="text-rose-400 space-y-2">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-semibold">{error}</p>
                <button
                  onClick={fetchSessions}
                  className="text-xs text-fuchsia-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <div className="text-slate-500">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs font-semibold mt-2 text-slate-400">No sessions yet</p>
                <p className="text-[10px] text-slate-500">Create your first creative session</p>
              </div>
            </div>
          ) : (
            sessions.map((item) => (
              <div
                key={item.id}
                className={`
                  p-3.5 rounded-xl border transition-all duration-300 group relative
                  ${currentSessionId === item.id 
                    ? 'bg-fuchsia-500/10 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.1)]' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                  }
                `}
              >
                <div 
                  className="flex items-start justify-between gap-2.5 cursor-pointer mb-2"
                  onClick={() => onSessionSelect(item.id)}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className={`
                        px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider
                        ${getPhaseBadge(item.currentPhase)}
                      `}>
                        {item.currentPhase || 'Setup'}
                      </span>
                      <span className={`
                        px-1.5 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider
                        ${getStatusColor(item.status)}
                      `}>
                        {item.status}
                      </span>
                    </div>
                    
                    <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-slate-100 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {formatDate(item.updatedAt)}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all duration-300"
                    title="Delete session"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {item.problemStatement && (
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-2.5 line-clamp-2">
                    {item.problemStatement}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <span className="flex items-center space-x-1" title="Generated Ideas">
                      <svg className="w-3 h-3 text-purple-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="font-semibold text-slate-400">{item.ideasCount}</span>
                    </span>
                    <span className="flex items-center space-x-1" title="Idea Clusters">
                      <svg className="w-3 h-3 text-blue-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="font-semibold text-slate-400">{item.clustersCount}</span>
                    </span>
                  </div>
                  {item.techniquesUsed.length > 0 && (
                    <span className="text-[9px] bg-slate-800 border border-slate-700/50 px-1.5 py-0.5 rounded text-slate-400">
                      {item.techniquesUsed.length} active techniques
                    </span>
                  )}
                </div>
                
                {/* Delete Confirmation */}
                {showDeleteConfirm === item.id && (
                  <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-center text-center space-y-2.5 z-10 border border-rose-500/20">
                    <p className="text-xs text-rose-300 font-semibold">
                      Permanently delete this session?
                    </p>
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteSession(item.id)}
                        disabled={deletingSessionId === item.id}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center space-x-1"
                      >
                        {deletingSessionId === item.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
