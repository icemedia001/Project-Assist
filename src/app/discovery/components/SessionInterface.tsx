"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

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
          content: "Welcome to the Discovery System!\n\nAvailable Commands:\n• @help - Show all available commands and how to use them\n• @brainstorm - Start an interactive brainstorming session with guided techniques\n• @analyst - Start a business analysis session for market research and competitive analysis\n• @pm - Start a project management session for idea prioritization and planning\n• @architect - Start a technical architecture session for system design\n• @validator - Start a validation session for risk assessment and feasibility\n\nTo begin, type a command (e.g., @brainstorm)",
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

  return (
    <div className="surface">
      <div className="px-6 py-4 border-b border-[color:var(--border)]">
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

      <div className="h-96 overflow-y-auto px-6 py-4 space-y-4">
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
                  : "bg-yellow-600/20 text-yellow-300"
              }`}
            >
              {message.type === "technique" && (
                <div className="flex items-center mb-2">
                  <span className="text-xs font-medium bg-purple-500/20 px-2 py-1 rounded-full">
                    {message.technique || "Technique"}
                  </span>
                </div>
              )}
              <div className="text-sm whitespace-pre-line">{message.content}</div>
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

      <div className="px-6 py-4 border-t border-[color:var(--border)]">
        {showCommandValidation && (
          <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-md text-yellow-300 text-sm">
            Please start with a command (e.g., @help or @brainstorm)
          </div>
        )}
        <div className="flex space-x-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !sessionId
                ? "Type a command to begin (e.g., @brainstorm)..."
                : "Share your thoughts, ideas, or responses..."
            }
            className="flex-1 resize-none rounded-md px-3 py-2 text-sm bg-[color:var(--surface)] text-[color:var(--text)] border border-[color:var(--border)] placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent"
            rows={2}
            disabled={isLoading || isStreaming}
          />
          <button
            onClick={!sessionId ? handleStartSession : handleSendMessage}
            disabled={!input.trim() || isLoading || isStreaming}
            className="px-4 py-2 text-sm font-medium rounded-md btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {!sessionId ? "Start" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
