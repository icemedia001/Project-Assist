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
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "paused":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase?.toLowerCase()) {
      case "brainstorming":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "analysis":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "planning":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "architecture":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "validation":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-[color:var(--surface)] border-r border-[color:var(--border)] z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--border)]">
          <h3 className="text-lg font-semibold text-[color:var(--text)]">
            Session History
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchSessions}
              disabled={isLoading}
              className="p-1.5 rounded-md hover:bg-[color:var(--accent)]/10 text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
              title="Refresh sessions"
            >
              <svg 
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-[color:var(--accent)]/10 text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors lg:hidden"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Session Button */}
        <div className="p-4 border-b border-[color:var(--border)]">
          <button
            onClick={onNewSession}
            className="w-full px-4 py-2 bg-[color:var(--accent)] hover:bg-[color:var(--accent)]/90 text-[color:var(--accent-contrast)] rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Session</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto min-h-0 sidebar-container">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-[color:var(--accent)] border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-[color:var(--muted)]">Loading sessions...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <div className="text-red-400 mb-2">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-300">{error}</p>
                <button
                  onClick={fetchSessions}
                  className="mt-2 text-xs text-[color:var(--accent)] hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center">
              <div className="text-[color:var(--muted)] mb-2">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No sessions yet</p>
                <p className="text-xs text-[color:var(--muted)] mt-1">Start your first discovery session</p>
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`
                    p-3 rounded-md transition-all duration-200 group
                    ${currentSessionId === session.id 
                      ? 'bg-[color:var(--accent)]/20 border border-[color:var(--accent)]/30' 
                      : 'hover:bg-[color:var(--accent)]/10 border border-transparent'
                    }
                  `}
                >
                  <div 
                    className="flex items-start justify-between mb-2 cursor-pointer"
                    onClick={() => onSessionSelect(session.id)}
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-medium border
                        ${getPhaseColor(session.currentPhase)}
                      `}>
                        {session.currentPhase || 'Unknown'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-[color:var(--text)] truncate">
                          {session.title}
                        </h4>
                        <p className="text-xs text-[color:var(--muted)]">
                          {formatDate(session.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium border
                        ${getStatusColor(session.status)}
                      `}>
                        {session.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
                        title="Delete session"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {session.problemStatement && (
                    <p className="text-xs text-[color:var(--muted)] mb-2 line-clamp-2">
                      {session.problemStatement}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>{session.ideasCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>{session.clustersCount}</span>
                      </span>
                    </div>
                    {session.techniquesUsed.length > 0 && (
                      <span className="text-xs bg-[color:var(--accent)]/10 px-2 py-1 rounded">
                        {session.techniquesUsed.length} techniques
                      </span>
                    )}
                  </div>
                  
                  {/* Delete Confirmation */}
                  {showDeleteConfirm === session.id && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                      <p className="text-sm text-red-300 mb-3">
                        Are you sure you want to delete this session? This action cannot be undone.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          disabled={deletingSessionId === session.id}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          {deletingSessionId === session.id ? (
                            <>
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <span>Delete</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
