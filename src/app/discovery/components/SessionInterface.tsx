"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import SessionSidebar from "./SessionSidebar";
import { COMMAND_OPTIONS, WELCOME_MESSAGE, parseCommand } from "../../../constants/commands";

interface SessionInterfaceProps {
  sessionId: string | null;
  onSessionStart: (id: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface Message {
  id: string;
  type: "user" | "agent" | "system" | "technique";
  content: string;
  timestamp: Date;
  phase?: string;
  technique?: string;
  waitingForResponse?: boolean;
}

export default function SessionInterface({
  sessionId,
  onSessionStart,
  isLoading,
  setIsLoading,
}: SessionInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showCommandValidation, setShowCommandValidation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessageResponse = async (message: string, isTechniqueSelection = false) => {
    if (!sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: isTechniqueSelection ? "technique" : "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch(`/api/session/${sessionId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: data.response || "I've processed your message. Let me continue with the discovery process.",
        timestamp: new Date(),
        phase: data.phase,
        waitingForResponse: data.waitingForResponse || false,
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: "Sorry, I couldn't process your message. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setMessages([
        {
          id: "welcome",
          type: "system",
          content: WELCOME_MESSAGE,
          timestamp: new Date(),
        },
      ]);
      setSessionEnded(false);
      setReportData(null);
    } else {
      loadMessageHistory();
    }
  }, [sessionId]);

  const loadMessageHistory = async () => {
    if (!sessionId) return;
    
    setIsLoadingHistory(true);
    
    try {
      const response = await fetch(`/api/session/${sessionId}/messages`);
      
      if (response.ok) {
        const data = await response.json();
        
        const historyMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: new Date(msg.timestamp || msg.createdAt),
          phase: msg.phase,
          technique: msg.technique,
        }));
        
        setMessages(historyMessages);
        
        // If the session was already completed, fetch its report status
        const sessionDetailsResponse = await fetch("/api/sessions");
        if (sessionDetailsResponse.ok) {
          const sessionsData = await sessionDetailsResponse.json();
          const activeSess = sessionsData.sessions?.find((s: any) => s.id === sessionId);
          if (activeSess && activeSess.status === "completed") {
            const reportResponse = await fetch(`/api/report/${sessionId}`);
            if (reportResponse.ok) {
              const reportResult = await reportResponse.json();
              setReportData(reportResult);
              setSessionEnded(true);
            }
          }
        }
      } else {
        console.error("Failed to fetch messages, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to load message history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleStartSession = async (customInput?: string) => {
    const textToSubmit = customInput || input.trim();
    if (!textToSubmit || !session?.user?.id) return;

    const command = parseCommand(textToSubmit);
    
    if (!command) {
      setShowCommandValidation(true);
      setTimeout(() => setShowCommandValidation(false), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: command.command,
          args: command.args,
          title: `Discovery Session - ${new Date().toLocaleDateString()}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start session");
      }

      const data = await response.json();
      
      if (data.sessionId) {
        onSessionStart(data.sessionId);
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: textToSubmit,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInput("");

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: data.response || "Great! I've started your discovery session. Now let's explore your idea through structured brainstorming techniques.",
        timestamp: new Date(),
        phase: data.phase || "brainstorming",
        waitingForResponse: data.sessionId ? true : false,
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error("Failed to start session:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "system",
        content: "Sorry, I couldn't start your session. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId || isStreaming) return;
    
    const message = input.trim();
    setInput("");
    await handleMessageResponse(message, false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sessionId) {
        handleStartSession();
      } else {
        handleSendMessage();
      }
    }
  };

  const filteredCommands = (() => {
    const atMatch = input.match(/^@(\w*)$/) || input.match(/^@(\w*)\s.*$/);
    if (!atMatch) return COMMAND_OPTIONS;
    const typed = (atMatch[1] || "").toLowerCase();
    return COMMAND_OPTIONS.filter(opt => opt.key.startsWith(typed));
  })();

  const handleInputChange = (value: string) => {
    setInput(value);
    const isTypingCommand = /^@\w*$/.test(value);
    setShowCommandMenu(isTypingCommand);
    if (!isTypingCommand) {
      setSelectedCommandIndex(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showCommandMenu) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedCommandIndex((prev) => Math.min(prev + 1, Math.max(filteredCommands.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedCommandIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        const cmd = filteredCommands[selectedCommandIndex]?.key || filteredCommands[0].key;
        setInput(`@${cmd} `);
        setShowCommandMenu(false);
      }
    } else if (e.key === "Enter" && showCommandMenu) {
      if (filteredCommands.length > 0) {
        e.preventDefault();
        const cmd = filteredCommands[selectedCommandIndex]?.key || filteredCommands[0].key;
        setInput(`@${cmd} `);
        setShowCommandMenu(false);
      }
    } else if (e.key === "Escape") {
      setShowCommandMenu(false);
    }
  };

  const handleSessionSelect = (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;
    onSessionStart(selectedSessionId);
    setSidebarOpen(false);
  };

  const handleNewSession = () => {
    onSessionStart('');
    setSidebarOpen(false);
  };

  const handleSessionDelete = (deletedSessionId: string) => {
    if (sessionId === deletedSessionId) {
      onSessionStart('');
      setMessages([]);
      setSessionEnded(false);
      setReportData(null);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId || isEndingSession) return;

    setIsEndingSession(true);
    try {
      const endResponse = await fetch(`/api/session/${sessionId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!endResponse.ok) {
        throw new Error("Failed to end session");
      }

      const reportResponse = await fetch(`/api/report/${sessionId}`);
      if (!reportResponse.ok) {
        throw new Error("Failed to generate report");
      }

      const reportResult = await reportResponse.json();
      setReportData(reportResult);
      setSessionEnded(true);
      
      const endMessage: Message = {
        id: Date.now().toString(),
        type: "system",
        content: "Session ended successfully. Your discovery report is ready below.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, endMessage]);

    } catch (error) {
      console.error("Failed to end session:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "system",
        content: "Sorry, I couldn't end the session. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleChipClick = (cmd: string, placeholderIdea: string) => {
    const formatted = `@${cmd} ${placeholderIdea}`;
    setInput(formatted);
    setShowCommandMenu(false);
  };

  const getAgentColorDot = (key: string) => {
    switch (key) {
      case "brainstorm": return "bg-purple-500 shadow-[0_0_8px_#a855f7]";
      case "pm": return "bg-emerald-500 shadow-[0_0_8px_#10b981]";
      case "architect": return "bg-orange-500 shadow-[0_0_8px_#f97316]";
      case "validator": return "bg-pink-500 shadow-[0_0_8px_#ec4899]";
      case "analyst": return "bg-blue-500 shadow-[0_0_8px_#3b82f6]";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="flex h-full bg-[#0b0f19]">
      {/* Sidebar */}
      <SessionSidebar
        currentSessionId={sessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onSessionDelete={handleSessionDelete}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10 border-l border-white/5">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0d1220]/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-200">
                Workspace
              </h2>
              {sessionId && (
                <div className="flex items-center space-x-2 mt-0.5">
                  <p className="text-[11px] text-slate-500 font-semibold font-mono">
                    ID: {sessionId.slice(0, 12)}...
                  </p>
                  {isLoadingHistory && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-1"></span>
                      Syncing history
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {sessionId && !sessionEnded && (
            <button
              onClick={handleEndSession}
              disabled={isEndingSession || isStreaming}
              className="px-4.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isEndingSession ? "Ending..." : "End Session"}
            </button>
          )}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-6 main-content">
          {messages.map((message) => {
            if (message.type === "system" && message.id === "welcome") {
              // Beautiful Custom Welcome card instead of raw system prompt
              return (
                <div key={message.id} className="max-w-3xl mx-auto py-8 px-6 glass-panel border border-white/5 space-y-5 text-center sm:text-left">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
                      Project Assist Discovery Workspace
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      Brainstorm, map design layouts, write product requirements documents, and validate project feasibility side-by-side with specialized AI agents.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-left">
                    {COMMAND_OPTIONS.map((cmd) => (
                      <div 
                        key={cmd.key}
                        onClick={() => handleChipClick(cmd.key, "a new project")}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.02] cursor-pointer transition-all duration-300 group flex items-start space-x-3"
                      >
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${getAgentColorDot(cmd.key)}`}></span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-200 group-hover:text-fuchsia-300 transition-colors">
                            @{cmd.key}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                            {cmd.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (message.type === "system") {
              return (
                <div key={message.id} className="flex justify-center my-3">
                  <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/5 text-slate-400 font-mono">
                    {message.content}
                  </span>
                </div>
              );
            }

            const isUser = message.type === "user" || message.type === "technique";
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"} message-enter`}
              >
                <div className={`flex flex-col space-y-1 max-w-[85%] md:max-w-2xl ${isUser ? "items-end" : "items-start"}`}>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 px-2 font-semibold">
                    {!isUser && (
                      <span className="text-fuchsia-400">@assist</span>
                    )}
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.phase && (
                      <span className="uppercase text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        {message.phase}
                      </span>
                    )}
                  </div>
                  
                  <div
                    className={`px-5 py-3.5 rounded-2xl shadow-lg border ${
                      isUser
                        ? "bg-gradient-to-br from-fuchsia-600/90 to-purple-600/95 border-fuchsia-500/20 text-white rounded-tr-sm"
                        : message.type === "technique"
                        ? "bg-purple-950/20 border-purple-500/30 text-purple-300 rounded-tl-sm"
                        : "bg-[#121625]/90 border-white/5 text-slate-200 rounded-tl-sm"
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      {!isUser ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-line font-medium">{message.content}</div>
                      )}
                    </div>

                    {message.waitingForResponse && (
                      <div className="flex items-center mt-3 pt-2.5 border-t border-white/5 text-[10px] font-semibold text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mr-2"></span>
                        Awaiting your reply...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {isStreaming && (
            <div className="flex justify-start message-enter">
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-500 px-2 font-semibold">Thinking...</span>
                <div className="bg-[#121625]/95 border border-white/5 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-md">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 bg-fuchsia-500/50 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-fuchsia-500/50 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                    <div className="w-2.5 h-2.5 bg-fuchsia-500/50 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Ending Session Report block */}
        {sessionEnded && reportData && (
          <div className="px-6 py-6 border-t border-white/5 bg-emerald-500/[0.02]">
            <div className="max-w-3xl mx-auto glass-panel border border-emerald-500/20 p-6 relative overflow-hidden rounded-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
              
              <div className="prose prose-invert prose-sm max-w-none">
                <h3 className="text-lg font-bold text-emerald-400 flex items-center space-x-2">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Discovery Session Finalized Successfully</span>
                </h3>
                
                <p className="text-slate-300 mt-2">
                  Your structured design concepts, priorities, and implementation ideas have been aggregated into a discovery report.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Phase</span>
                    <span className="text-slate-200 font-semibold">{reportData.report?.currentPhase || 'Brainstorming'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
                    <span className="text-emerald-400 font-semibold">Completed</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setSessionEnded(false);
                    setReportData(null);
                    setMessages([]);
                    onSessionStart('');
                  }}
                  className="btn-secondary px-5 py-2 text-xs font-bold rounded-lg"
                >
                  Start New Session
                </button>
                
                <a
                  href={reportData.downloadUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-5 py-2 text-xs font-bold rounded-lg shadow-md flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Full PDF Report</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Input panel & Suggestions */}
        <div className="px-6 py-5 bg-[#0b0f19] border-t border-white/5 space-y-4">
          
          {/* Quick Start chips if zero messages or welcome screen */}
          {(!sessionId || messages.length <= 1) && (
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Quick Prompts Suggestions</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleChipClick("brainstorm", "a real-time fitness challenge mobile app")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 hover:border-purple-500/35 transition-all duration-300 cursor-pointer"
                >
                  💡 @brainstorm fitness app
                </button>
                <button
                  onClick={() => handleChipClick("architect", "a multiplayer 3D canvas collaboration game")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/20 hover:border-orange-500/35 transition-all duration-300 cursor-pointer"
                >
                  📐 @architect multiplayer game
                </button>
                <button
                  onClick={() => handleChipClick("pm", "a subscription billing dashboard for SaaS")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/35 transition-all duration-300 cursor-pointer"
                >
                  📊 @pm subscription billing
                </button>
              </div>
            </div>
          )}

          {showCommandValidation && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold flex items-center space-x-2 animate-bounce">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Please start with a valid command prefix, e.g., @brainstorm, @pm, @architect, or @validator.</span>
            </div>
          )}

          <div className="flex items-end space-x-3 relative">
            
            {/* Redesigned Autocomplete Menu */}
            {showCommandMenu && (
              <div className="absolute top-0 left-0 right-0 -translate-y-full z-20 pb-2">
                <div className="glass-panel bg-[#0e1424]/95 border border-white/10 shadow-2xl rounded-2xl overflow-hidden p-2">
                  <div className="px-3 py-1.5 border-b border-white/5 mb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Available Agents Commands</span>
                    <span>Use Tab / Enter to select</span>
                  </div>
                  <ul className="max-h-60 overflow-y-auto text-xs space-y-0.5">
                    {filteredCommands.length === 0 && (
                      <li className="px-3 py-2 text-slate-500 font-semibold">No agents found matching that search</li>
                    )}
                    {filteredCommands.map((opt, idx) => (
                      <li
                        key={opt.key}
                        className={`
                          px-3 py-2 cursor-pointer rounded-lg transition-all duration-200 flex items-center justify-between
                          ${idx === selectedCommandIndex 
                            ? "bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300" 
                            : "text-slate-300 hover:bg-white/5 border border-transparent"
                          }
                        `}
                        onMouseEnter={() => setSelectedCommandIndex(idx)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setInput(`@${opt.key} `);
                          setShowCommandMenu(false);
                        }}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className={`w-2 h-2 rounded-full ${getAgentColorDot(opt.key)}`}></span>
                          <span className="font-bold">@{opt.key}</span>
                          <span className="text-slate-500 hidden sm:inline">—</span>
                          <span className="text-slate-400 text-[10px]">{opt.description}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 hidden sm:inline uppercase">Agent Active</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onKeyDown={handleKeyDown}
              placeholder={
                !sessionId
                  ? "Type a command to begin (e.g., @brainstorm a new mobile fitness app)..."
                  : sessionEnded
                  ? "Session ended. Reset to start a new session."
                  : "Share your thoughts, answers, or requests with the agent..."
              }
              className="flex-1 resize-none rounded-xl px-4 py-3 text-xs bg-slate-950/60 text-slate-100 border border-white/5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent min-h-[50px] max-h-[160px] font-medium"
              rows={2}
              disabled={isLoading || isStreaming || sessionEnded}
            />

            <button
              onClick={!sessionId ? () => handleStartSession() : handleSendMessage}
              disabled={!input.trim() || isLoading || isStreaming || sessionEnded}
              className="btn-primary px-5 py-3 rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shrink-0 shadow-md flex items-center space-x-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span>{!sessionId ? "Start" : "Send"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}