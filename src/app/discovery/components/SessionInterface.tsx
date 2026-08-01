"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import SessionSidebar from "./SessionSidebar";
import MermaidRenderer from "../../components/ui/MermaidRenderer";
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

interface Idea {
  id: string;
  title: string;
  description: string;
  rationale?: string;
  feasibility?: string;
  impact?: string;
  effort?: string;
  score?: number;
  createdAt: string;
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

  const [activeMobileView, setActiveMobileView] = useState<"chat" | "canvas">("chat");
  const [activeCanvasTab, setActiveCanvasTab] = useState<"ideas" | "architecture" | "prd">("ideas");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setIdeas([]);
    } else {
      loadMessageHistory();
      fetchIdeas();
    }
  }, [sessionId]);

  const fetchIdeas = async () => {
    if (!sessionId) return;
    setIdeasLoading(true);
    try {
      const response = await fetch(`/api/session/${sessionId}/ideas`);
      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas || []);
      }
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    } finally {
      setIdeasLoading(false);
    }
  };

  const handleUpdateIdea = async (ideaId: string, updates: { feasibility?: string; impact?: string; effort?: string }) => {
    if (!sessionId) return;

    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === ideaId) {
          const nextFeasibility = updates.feasibility !== undefined ? updates.feasibility : idea.feasibility;
          const nextImpact = updates.impact !== undefined ? updates.impact : idea.impact;
          const nextEffort = updates.effort !== undefined ? updates.effort : idea.effort;

          const scoresMap = { High: 3, Strong: 3, Medium: 2, Low: 1, Weak: 1 };
          const f = scoresMap[nextFeasibility as keyof typeof scoresMap] || 0;
          const i = scoresMap[nextImpact as keyof typeof scoresMap] || 0;
          const e = scoresMap[nextEffort as keyof typeof scoresMap] || 0;
          const computedScore = (f + i + (4 - e)) / 3;

          return { ...idea, ...updates, score: computedScore };
        }
        return idea;
      })
    );

    try {
      const response = await fetch(`/api/session/${sessionId}/ideas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId, ...updates }),
      });

      if (!response.ok) {
        throw new Error("Failed to update idea");
      }

      const data = await response.json();
      setIdeas((prev) => {
        const updated = prev.map((idea) => (idea.id === ideaId ? data.idea : idea));
        return [...updated].sort((a, b) => (b.score || 0) - (a.score || 0));
      });
    } catch (error) {
      console.error("Error updating idea score:", error);
      fetchIdeas(); 
    }
  };

  const handleMessageResponse = async (message: string, isTechniqueSelection = false) => {
    if (!sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: isTechniqueSelection ? "technique" : "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
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

      setMessages((prev) => [...prev, agentMessage]);
      fetchIdeas(); 

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: "Sorry, I couldn't process your message. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

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

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: data.response || "Great! I've started your discovery session. Now let's explore your idea through structured brainstorming techniques.",
        timestamp: new Date(),
        phase: data.phase || "brainstorming",
        waitingForResponse: data.sessionId ? true : false,
      };

      setMessages((prev) => [...prev, agentMessage]);

    } catch (error) {
      console.error("Failed to start session:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "system",
        content: "Sorry, I couldn't start your session. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
    return COMMAND_OPTIONS.filter((opt) => opt.key.startsWith(typed));
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
    onSessionStart("");
    setSidebarOpen(false);
  };

  const handleSessionDelete = (deletedSessionId: string) => {
    if (sessionId === deletedSessionId) {
      onSessionStart("");
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
      setMessages((prev) => [...prev, endMessage]);

    } catch (error) {
      console.error("Failed to end session:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "system",
        content: "Sorry, I couldn't end the session. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  const markdownComponents = {
    code({ node, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const isMermaid = match && match[1] === "mermaid";
      if (isMermaid) {
        return <MermaidRenderer chart={String(children).replace(/\n$/, "")} />;
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  const architectureMessagesContent = messages
    .filter((msg) => 
      msg.phase?.toLowerCase() === "architecture" || 
      msg.content.toLowerCase().includes("architecture") ||
      msg.content.toLowerCase().includes("mermaid") ||
      msg.content.toLowerCase().includes("tech stack")
    )
    .map((msg) => msg.content)
    .join("\n\n");

  const prdMessagesContent = messages
    .filter((msg) => 
      msg.phase?.toLowerCase() === "prioritization" || 
      msg.phase?.toLowerCase() === "setup" ||
      msg.phase?.toLowerCase() === "validation"
    )
    .map((msg) => msg.content)
    .join("\n\n");

  const scoreColor = (score: number) => {
    if (score >= 2.5) return "from-emerald-500 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]";
    if (score >= 1.8) return "from-fuchsia-500 to-purple-500 shadow-[0_0_12px_rgba(217,70,239,0.4)]";
    return "from-amber-500 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]";
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#0b0f19]">
      {/* Sidebar */}
      <SessionSidebar
        currentSessionId={sessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onSessionDelete={handleSessionDelete}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main split grid layout */}
      <div className="flex-1 flex min-h-0 relative z-10 border-l border-white/5 divide-x divide-white/5">
        
        {/* Left Column: Conversational Workspace */}
        <div 
          className={`flex-col h-full min-h-0 relative ${
            sessionId 
              ? activeMobileView === "chat" 
                ? "flex w-full lg:w-[45%]" 
                : "hidden lg:flex lg:w-[45%]" 
              : "flex w-full"
          }`}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#0d1220]/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3.5 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors lg:hidden shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="truncate">
                <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                  <span>Workshop Chat</span>
                </h2>
                {sessionId && (
                  <p className="text-[10px] text-slate-500 font-bold font-mono mt-0.5 truncate">
                    ID: {sessionId.slice(0, 16)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Header controls: Mobile view switcher & End Session button */}
            <div className="flex items-center space-x-2 shrink-0">
              {sessionId && (
                <div className="flex lg:hidden bg-slate-950/80 p-0.5 rounded-lg border border-white/5 mr-2">
                  <button
                    onClick={() => setActiveMobileView("chat")}
                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                      activeMobileView === "chat" 
                        ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveMobileView("canvas")}
                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                      activeMobileView === "canvas" 
                        ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Canvas
                  </button>
                </div>
              )}

              {sessionId && !sessionEnded && (
                <button
                  onClick={handleEndSession}
                  disabled={isEndingSession || isStreaming}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isEndingSession ? "Ending..." : "End"}
                </button>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-5 main-content">
            {messages.map((message) => {
              if (message.type === "system" && message.id === "welcome") {
                return (
                  <div key={message.id} className="max-w-3xl mx-auto py-8 px-6 glass-panel border border-white/5 space-y-5 text-center sm:text-left">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-wider">
                        Project Assist Discovery
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                        A structured multi-agent workshop environment. Brainstorm your ideas, prioritization scoring models, technical system flowcharts, and compile comprehensive project specifications.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-left">
                      {COMMAND_OPTIONS.map((cmd) => (
                        <div 
                          key={cmd.key}
                          onClick={() => handleChipClick(cmd.key, "a new project")}
                          className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-fuchsia-500/20 hover:bg-fuchsia-500/[0.01] cursor-pointer transition-all duration-300 group flex items-start space-x-3"
                        >
                          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${getAgentColorDot(cmd.key)}`}></span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-200 group-hover:text-fuchsia-300 transition-colors">
                              @{cmd.key}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
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
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/[0.03] border border-white/5 text-slate-400 font-mono">
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
                    <div className="flex items-center space-x-2 text-[9px] text-slate-500 px-2 font-bold uppercase tracking-wider">
                      {!isUser && (
                        <span className="text-fuchsia-400">@assist</span>
                      )}
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.phase && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
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
                      <div className="text-xs leading-relaxed">
                        {!isUser ? (
                          <div className="prose prose-invert prose-xs max-w-none">
                            <ReactMarkdown components={markdownComponents}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-line font-semibold">{message.content}</div>
                        )}
                      </div>

                      {message.waitingForResponse && (
                        <div className="flex items-center mt-3 pt-2.5 border-t border-white/5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mr-2"></span>
                          Awaiting your response...
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
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-2">Thinking...</span>
                  <div className="bg-[#121625]/95 border border-white/5 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-md">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 bg-fuchsia-500/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-fuchsia-500/50 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                      <div className="w-2 h-2 bg-fuchsia-500/50 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel & Suggestions */}
          <div className="px-6 py-5 bg-[#0b0f19] border-t border-white/5 space-y-4">
            
            {(!sessionId || messages.length <= 1) && (
              <div className="flex flex-col space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Quick Prompts Suggestions</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleChipClick("brainstorm", "a real-time fitness challenge mobile app")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 hover:border-purple-500/35 transition-all duration-300 cursor-pointer"
                  >
                    💡 @brainstorm fitness app
                  </button>
                  <button
                    onClick={() => handleChipClick("architect", "a multiplayer 3D canvas collaboration game")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/20 hover:border-orange-500/35 transition-all duration-300 cursor-pointer"
                  >
                    📐 @architect multiplayer game
                  </button>
                  <button
                    onClick={() => handleChipClick("pm", "a subscription billing dashboard for SaaS")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/35 transition-all duration-300 cursor-pointer"
                  >
                    📊 @pm subscription billing
                  </button>
                </div>
              </div>
            )}

            {showCommandValidation && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-bold flex items-center space-x-2 animate-bounce">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Please start with a valid command prefix, e.g., @brainstorm, @pm, @architect, or @validator.</span>
              </div>
            )}

            <div className="flex items-end space-x-3 relative">
              
              {/* Autocomplete Menu */}
              {showCommandMenu && (
                <div className="absolute top-0 left-0 right-0 -translate-y-full z-20 pb-2">
                  <div className="glass-panel bg-[#0e1424]/95 border border-white/10 shadow-2xl rounded-2xl overflow-hidden p-2">
                    <div className="px-3 py-1.5 border-b border-white/5 mb-1.5 flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <span>Available Workshop Commands</span>
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
                          <span className="text-[10px] font-bold text-slate-500 hidden sm:inline uppercase">Active</span>
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
                className="flex-1 resize-none rounded-xl px-4 py-3 text-xs bg-slate-950/60 text-slate-100 border border-white/5 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-transparent min-h-[50px] max-h-[160px] font-semibold"
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

        {/* Right Column: Live Workspace Canvas (only when sessionId is active) */}
        {sessionId && (
          <div 
            className={`flex-col h-full min-h-0 bg-[#0d1220]/20 ${
              activeMobileView === "canvas" 
                ? "flex w-full lg:w-[55%]" 
                : "hidden lg:flex lg:w-[55%]"
            }`}
          >
            {/* Header Tabs */}
            <div className="px-6 py-4 border-b border-white/5 bg-[#0d1220]/30 backdrop-blur-md flex items-center justify-between overflow-x-auto select-none shrink-0">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveCanvasTab("ideas")}
                  className={`px-4.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center space-x-2 ${
                    activeCanvasTab === "ideas"
                      ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-600/10 border border-fuchsia-500/20"
                      : "text-slate-400 hover:text-slate-200 bg-white/[0.01] border border-white/5"
                  }`}
                >
                  <span>💡</span>
                  <span>Ideas Canvas</span>
                </button>
                <button
                  onClick={() => setActiveCanvasTab("architecture")}
                  className={`px-4.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center space-x-2 ${
                    activeCanvasTab === "architecture"
                      ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-600/10 border border-fuchsia-500/20"
                      : "text-slate-400 hover:text-slate-200 bg-white/[0.01] border border-white/5"
                  }`}
                >
                  <span>📐</span>
                  <span>Architecture</span>
                </button>
                <button
                  onClick={() => setActiveCanvasTab("prd")}
                  className={`px-4.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center space-x-2 ${
                    activeCanvasTab === "prd"
                      ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-600/10 border border-fuchsia-500/20"
                      : "text-slate-400 hover:text-slate-200 bg-white/[0.01] border border-white/5"
                  }`}
                >
                  <span>📝</span>
                  <span>PRD Specs</span>
                </button>
              </div>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* IDEAS TAB PANEL */}
              {activeCanvasTab === "ideas" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Brainstormed Concepts</h3>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Dynamic Priority Scorecard</p>
                    </div>
                    {ideasLoading && (
                      <span className="w-4 h-4 border border-fuchsia-500 border-t-transparent rounded-full animate-spin"></span>
                    )}
                  </div>

                  {ideas.length === 0 ? (
                    <div className="py-20 text-center glass-panel border border-white/5 max-w-lg mx-auto rounded-2xl flex flex-col items-center justify-center p-6 space-y-3">
                      <div className="w-12 h-12 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center text-xl">💡</div>
                      <p className="text-xs font-bold text-slate-400">No concepts registered yet.</p>
                      <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed font-semibold">
                        Start talking to the <span className="text-purple-400 font-black">@brainstorm</span> agent to generate features, specifications, and layout designs.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {ideas.map((idea) => (
                        <div key={idea.id} className="glass-panel border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-all duration-300 relative flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-5">
                          
                          {/* Score Badge */}
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${scoreColor(idea.score || 0)} flex flex-col items-center justify-center border border-white/10 shrink-0`}>
                            <span className="text-xs font-black text-white">{Number(idea.score || 0).toFixed(1)}</span>
                            <span className="text-[7px] font-bold text-white/80 uppercase tracking-widest mt-[-2px]">Score</span>
                          </div>

                          {/* Detail Content */}
                          <div className="flex-1 min-w-0 space-y-3">
                            <div>
                              <h4 className="text-xs font-black text-slate-200 leading-tight truncate">{idea.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{idea.description}</p>
                              {idea.rationale && (
                                <p className="text-[9px] text-slate-500 italic mt-1 bg-white/[0.01] p-1 px-2 rounded border border-white/5">
                                  Rationale: {idea.rationale}
                                </p>
                              )}
                            </div>

                            {/* Live Estimation Sliders / Pill Selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-white/5">
                              
                              <SegmentedSelector
                                label="Feasibility"
                                value={idea.feasibility || "Medium"}
                                options={["High", "Medium", "Low"]}
                                onChange={(val) => handleUpdateIdea(idea.id, { feasibility: val })}
                                colorClass="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                              />

                              <SegmentedSelector
                                label="Impact"
                                value={idea.impact || "Medium"}
                                options={["Strong", "Medium", "Weak"]}
                                onChange={(val) => handleUpdateIdea(idea.id, { impact: val })}
                                colorClass="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                              />

                              <SegmentedSelector
                                label="Effort"
                                value={idea.effort || "Medium"}
                                options={["High", "Medium", "Low"]}
                                onChange={(val) => handleUpdateIdea(idea.id, { effort: val })}
                                colorClass="bg-gradient-to-r from-orange-600 to-amber-600 shadow-[0_0_8px_rgba(249,115,22,0.3)]"
                              />

                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ARCHITECTURE TAB PANEL */}
              {activeCanvasTab === "architecture" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">System Architectures</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Dynamic infrastructure schemas & designs</p>
                  </div>

                  {!architectureMessagesContent ? (
                    <div className="py-20 text-center glass-panel border border-white/5 max-w-lg mx-auto rounded-2xl flex flex-col items-center justify-center p-6 space-y-3">
                      <div className="w-12 h-12 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center text-xl">📐</div>
                      <p className="text-xs font-bold text-slate-400">No architecture definitions yet.</p>
                      <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed font-semibold">
                        Activate the <span className="text-orange-400 font-black">@architect</span> agent to model databases, tech stacks, and generate flowcharts.
                      </p>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-xs max-w-none bg-slate-950/20 border border-white/5 rounded-2xl p-5 shadow-inner">
                      <ReactMarkdown components={markdownComponents}>
                        {architectureMessagesContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              {/* PRODUCT REQUIREMENTS TAB PANEL */}
              {activeCanvasTab === "prd" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">PRD Specs & Details</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Active project requirements workspace</p>
                  </div>

                  {!prdMessagesContent && !sessionEnded ? (
                    <div className="py-20 text-center glass-panel border border-white/5 max-w-lg mx-auto rounded-2xl flex flex-col items-center justify-center p-6 space-y-3">
                      <div className="w-12 h-12 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center text-xl">📝</div>
                      <p className="text-xs font-bold text-slate-400">No specs compiled yet.</p>
                      <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed font-semibold">
                        Collaborate with the <span className="text-emerald-400 font-black">@pm</span> and <span className="text-blue-400 font-black">@analyst</span> agents to prioritize features and formulate PRD scopes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {sessionEnded && reportData && (
                        <div className="glass-panel border border-emerald-500/10 bg-emerald-500/[0.02] p-5 rounded-2xl space-y-3.5">
                          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                            Finalized Discovery Report
                          </h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                            Your collaborative blueprint has been finalized. Download it in full formats below.
                          </p>
                          <a
                            href={reportData.downloadUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center space-x-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download Full PDF Report</span>
                          </a>
                        </div>
                      )}

                      {(prdMessagesContent || (reportData && reportData.report)) && (
                        <div className="prose prose-invert prose-xs max-w-none bg-slate-950/20 border border-white/5 rounded-2xl p-5 shadow-inner">
                          <ReactMarkdown components={markdownComponents}>
                            {prdMessagesContent || (reportData && reportData.report?.problemStatement) || ""}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

interface SegmentedSelectorProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  colorClass: string;
}

function SegmentedSelector({
  label,
  value,
  options,
  onChange,
  colorClass,
}: SegmentedSelectorProps) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="grid grid-cols-3 gap-0.5 bg-slate-950/40 p-0.5 rounded-lg border border-white/5">
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`py-1 rounded-md text-[8px] font-black uppercase tracking-wider transition-all duration-200 truncate ${
                isSelected
                  ? `${colorClass} text-white`
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.01]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}