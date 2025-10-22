"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "@/app/components/Navigation";
import SessionInterface from "./components/SessionInterface";

export default function DiscoveryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);

  useEffect(() => {
    const sessionParam = searchParams.get("session");
    if (sessionParam) {
      setSessionId(sessionParam);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSessionStart = (id: string) => {
    setSessionId(id);
  };

  return (
    <div className="h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 overflow-hidden">
        <div className="h-full">
          <SessionInterface
            sessionId={sessionId}
            onSessionStart={handleSessionStart}
            isLoading={isSessionLoading}
            setIsLoading={setIsSessionLoading}
          />
        </div>
      </main>
    </div>
  );
}
