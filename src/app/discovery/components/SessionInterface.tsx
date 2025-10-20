"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import SessionSidebar from "./SessionSidebar";

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
  const commandOptions = [
    { key: "help", label: "@help – Show all available commands" },
    { key: "brainstorm", label: "@brainstorm – Start brainstorming session" },
    { key: "analyst", label: "@analyst – Start business analysis session" },
    { key: "pm", label: "@pm – Start project management session" },
    { key: "architect", label: "@architect – Start architecture session" },
    { key: "validator", label: "@validator – Start validation session" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const parseCommand = (input: string) => {
    const commandPattern = /^@(\w+)(\s+.*)?$/;
    const match = input.trim().match(commandPattern);
    if (match) {
      return {
        command: match[1].toLowerCase(),
        args: match[2]?.trim() || ""
      };
    }
    return null;
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
          content: "Welcome to Project Assist!\n\nAvailable Commands:\n• @help - Show all available commands and how to use them\n• @brainstorm - Start an interactive brainstorming session with guided techniques\n• @analyst - Start a business analysis session for market research and competitive analysis\n• @pm - Start a project management session for idea prioritization and planning\n• @architect - Start a technical architecture session for system design\n• @validator - Start a validation session for risk assessment and feasibility\n\nTo begin, type a command (e.g., @brainstorm)",
          timestamp: new Date(),
        },
      ]);
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
      } else {
        console.error("Failed to fetch messages, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to load message history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleStartSession = async () => {
    if (!input.trim() || !session?.user?.id) return;

    const command = parseCommand(input.trim());
    
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
        content: input.trim(),
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
    if (!atMatch) return commandOptions;
    const typed = (atMatch[1] || "").toLowerCase();
    return commandOptions.filter(opt => opt.key.startsWith(typed));
  })();

  const handleInputChange = (value: string) => {
    setInput(value);
    const startsWithAt = value.startsWith("@");
    setShowCommandMenu(startsWithAt);
    if (!startsWithAt) {
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
    // If the deleted session was the current one, clear the current session
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

  return (
    <div className="flex h-full">
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
      <div className="flex-1 flex flex-col surface min-h-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[color:var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-[color:var(--accent)]/10 text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors lg:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h2 className="text-lg font-semibold">
                  Discovery Session
                </h2>
                {sessionId && (
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-sm text-[color:var(--muted)]">
                      Session ID: {sessionId.slice(0, 8)}...
                    </p>
                    {isLoadingHistory && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                        Loading history...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-4 main-content">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} message-enter`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === "user"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                  : message.type === "agent"
                  ? "bg-[#1f2637] text-[color:var(--text)]"
                  : message.type === "technique"
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "bg-pink-600/20 text-pink-300"
              }`}
            >
              {message.type === "technique" && (
                <div className="flex items-center mb-2">
                  <span className="text-xs font-medium bg-purple-500/20 px-2 py-1 rounded-full">
                    {message.technique || "Technique"}
                  </span>
                </div>
              )}
              <div className="text-sm">
                {message.type === "agent" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-line">{message.content}</div>
                )}
              </div>
              {message.waitingForResponse && (
                <div className="flex items-center mt-2 text-xs opacity-70">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  Waiting for your response...
                </div>
              )}
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
                {message.phase && ` • ${message.phase}`}
              </p>
            </div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-[#1f2637] text-[color:var(--text)] px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">Thinking...</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[var(--accent)]/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[var(--accent)]/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-[var(--accent)]/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {sessionEnded && reportData && (
        <div className="px-6 py-4 border-t border-[color:var(--border)] bg-green-600/10">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-green-300 mb-2">Discovery Report</h3>
            <div className="bg-[color:var(--surface)] rounded-md p-4 border border-green-500/30">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>
                  {`# ${reportData.report?.title || 'Discovery Session Report'}

**Status:** ${reportData.report?.status || 'Completed'}  
**Phase:** ${reportData.report?.currentPhase || 'N/A'}  
**Created:** ${new Date(reportData.report?.createdAt).toLocaleString()}  
**Updated:** ${new Date(reportData.report?.updatedAt).toLocaleString()}

${reportData.report?.problemStatement ? `## Problem Statement\n\n${reportData.report.problemStatement}\n\n` : ''}

## Session Summary

This discovery session has been completed successfully. The report contains all the insights, ideas, and recommendations generated during your session.

[Download Full Report](${reportData.downloadUrl || '#'})`}
                </ReactMarkdown>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => {
                    setSessionEnded(false);
                    setReportData(null);
                    setMessages([]);
                    onSessionStart('');
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                >
                  Start New Session
                </button>
                <a
                  href={reportData.downloadUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
                >
                  Download Report
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-t border-[color:var(--border)]">
        {showCommandValidation && (
          <div className="mb-4 p-3 bg-pink-600/20 border border-pink-500/30 rounded-md text-pink-300 text-sm">
            Please start with a command (e.g., @help or @brainstorm)
          </div>
        )}
        <div className="flex space-x-4 relative">
          {showCommandMenu && (
            <div className="absolute -top-2 left-0 right-24 translate-y-[-100%] z-20">
              <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] shadow-lg overflow-hidden">
                <ul className="max-h-60 overflow-y-auto text-sm">
                  {filteredCommands.length === 0 && (
                    <li className="px-3 py-2 text-[color:var(--muted)]">No commands</li>
                  )}
                  {filteredCommands.map((opt, idx) => (
                    <li
                      key={opt.key}
                      className={`${idx === selectedCommandIndex ? "bg-[color:var(--accent)]/20" : ""} px-3 py-2 cursor-pointer hover:bg-[color:var(--accent)]/10`}
                      onMouseEnter={() => setSelectedCommandIndex(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setInput(`@${opt.key} `);
                        setShowCommandMenu(false);
                      }}
                    >
                      {opt.label}
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
                ? "Type a command to begin (e.g., @brainstorm)..."
                : sessionEnded
                ? "Session ended - view report below"
                : "Share your thoughts, ideas, or responses..."
            }
            className="flex-1 resize-none rounded-md px-3 py-2 text-sm bg-[color:var(--surface)] text-[color:var(--text)] border border-[color:var(--border)] placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent"
            rows={2}
            disabled={isLoading || isStreaming || sessionEnded}
          />
          {sessionId && !sessionEnded && (
            <button
              onClick={handleEndSession}
              disabled={isEndingSession || isStreaming}
              className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isEndingSession ? "Ending..." : "End Session"}
            </button>
          )}
          <button
            onClick={!sessionId ? handleStartSession : handleSendMessage}
            disabled={!input.trim() || isLoading || isStreaming || sessionEnded}
            className="px-4 py-2 text-sm font-medium rounded-md btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {!sessionId ? "Start" : "Send"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
