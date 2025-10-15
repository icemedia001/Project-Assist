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
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
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
