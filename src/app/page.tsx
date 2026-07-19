"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Navigation from "@/app/components/Navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  
  const [typedText, setTypedText] = useState("");
  const [terminalStep, setTerminalStep] = useState(0);

  useEffect(() => {
    const fullText = "@brainstorm a smart-grid management app for solar energy";
    let index = 0;
    let isMounted = true;

    const runSimulation = async () => {
      await new Promise((r) => setTimeout(r, 1500));
      
      while (index < fullText.length && isMounted) {
        setTypedText(fullText.substring(0, index + 1));
        index++;
        await new Promise((r) => setTimeout(r, 60 + Math.random() * 30));
      }
      
      if (!isMounted) return;
      
      await new Promise((r) => setTimeout(r, 800));
      setTerminalStep(1);
      
      await new Promise((r) => setTimeout(r, 2200));
      setTerminalStep(2); 
      
      await new Promise((r) => setTimeout(r, 2200));
      setTerminalStep(3); 
      
      await new Promise((r) => setTimeout(r, 6000));
      if (isMounted) {
        setTypedText("");
        setTerminalStep(0);
        runSimulation();
      }
    };

    runSimulation();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading Project Assist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <Navigation />
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-fuchsia-500/10 border border-fuchsia-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-fuchsia-300 shadow-sm animate-pulse-glow">
            <span>✨ Now in Beta: AI Collaborative Discovery Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
            AI agents at your command
            <span className="block mt-3 bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent text-glow">
              for every project challenge
            </span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed font-medium">
            Get instant direction from specialized AI agents. Use commands like <code className="text-fuchsia-400 bg-white/5 px-1.5 py-0.5 rounded">@brainstorm</code>, <code className="text-emerald-400 bg-white/5 px-1.5 py-0.5 rounded">@pm</code>, <code className="text-orange-400 bg-white/5 px-1.5 py-0.5 rounded">@architect</code>, or <code className="text-pink-400 bg-white/5 px-1.5 py-0.5 rounded">@validator</code> to build high-quality solutions.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/discovery"
                className="btn-primary flex items-center px-8 py-3.5 text-base font-semibold rounded-xl hover-lift shadow-[0_0_20px_rgba(217,70,239,0.3)] w-full sm:w-auto justify-center"
              >
                <svg className="w-5 h-5 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Enter Discovery Workspace
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="btn-primary flex items-center px-8 py-3.5 text-base font-semibold rounded-xl hover-lift shadow-[0_0_20px_rgba(217,70,239,0.3)] w-full sm:w-auto justify-center"
              >
                <svg className="w-5 h-5 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Get Started Free
              </Link>
            )}
            
            <Link
              href="/dashboard"
              className="btn-secondary flex items-center px-8 py-3.5 text-base font-semibold rounded-xl w-full sm:w-auto justify-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Interactive Terminal Showcase */}
        <div className="mt-16 max-w-4xl mx-auto glass-panel overflow-hidden shadow-2xl relative">
          {/* Header Controls */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-white/5">
            <div className="flex space-x-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono">project_assist_simulation.sh</span>
            <div className="w-10"></div>
          </div>
          
          {/* Terminal Workspace */}
          <div className="p-6 bg-slate-950/65 font-mono text-sm min-h-[300px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start space-x-2 text-slate-300">
                <span className="text-fuchsia-400 font-bold select-none">&gt;</span>
                <p className="flex-1 text-slate-100">
                  {typedText}
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-fuchsia-400 animate-pulse"></span>
                </p>
              </div>

              {terminalStep >= 1 && (
                <div className="space-y-1.5 border-l-2 border-purple-500/30 pl-4 py-0.5">
                  <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>@brainstorm</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Solar panels are distributed assets. Let's design 3 modules:
                    1. Real-time telemetry dashboard.
                    2. Dynamic battery capacity forecast using weather forecasting.
                    3. Peer-to-peer neighborhood power trading broker.
                  </p>
                </div>
              )}

              {terminalStep >= 2 && (
                <div className="space-y-1.5 border-l-2 border-emerald-500/30 pl-4 py-0.5">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>@pm</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Prioritizing: Telemetry has high feasibility/impact. P2P energy trading has high regulatory risk. Let's build MVP focus: Telemetry Dashboard & Weather Forecast integration first.
                  </p>
                </div>
              )}

              {terminalStep >= 3 && (
                <div className="space-y-1.5 border-l-2 border-orange-500/30 pl-4 py-0.5">
                  <div className="flex items-center space-x-2 text-orange-400 font-semibold text-xs">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>@architect</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    System Design: Use Next.js 15 for front-end, Fastify with WebSockets for telemetry ingestion, Redis for active caching, and PostgreSQL for historical metrics logs.
                  </p>
                </div>
              )}
            </div>
            
            <div className="text-xs text-slate-500 flex items-center justify-between border-t border-white/5 pt-4 mt-6">
              <span>Press cmd+k for command bar</span>
              <span>Workspace Active</span>
            </div>
          </div>
        </div>

        {/* Specialized Agents Feature Grid */}
        <div className="mt-24 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Specialized Collaborative Team</h2>
            <p className="text-slate-400 mt-2">Every agent is trained in distinct system layers and creative methodologies</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Brainstormer */}
            <div className="glow-card p-6 flex flex-col justify-between h-[220px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-500/20">
                    @brainstorm
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-100">Brainstorming Facilitator</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Triggers lateral thinking prompts, mind-mapping guides, and structured ideation techniques.
                </p>
              </div>
            </div>

            {/* PM */}
            <div className="glow-card p-6 flex flex-col justify-between h-[220px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
                    @pm
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-100">Product Manager</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Assists with idea sorting, impact/feasibility score boards, and PRD specifications formulation.
                </p>
              </div>
            </div>

            {/* Architect */}
            <div className="glow-card p-6 flex flex-col justify-between h-[220px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                    @architect
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-100">System Architect</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Designs multi-tier architectures, selects optimal data-stores, and outlines APIs patterns.
                </p>
              </div>
            </div>

            {/* Validator */}
            <div className="glow-card p-6 flex flex-col justify-between h-[220px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full text-xs font-semibold border border-pink-500/20">
                    @validator
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-100">Feasibility Validator</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Asks critical questions, performs regulatory reviews, and highlights potential security vulnerabilities.
                </p>
              </div>
            </div>

            {/* Analyst */}
            <div className="glow-card p-6 flex flex-col justify-between h-[220px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-500/20">
                    @analyst
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-100">Business Analyst</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Guides market positioning studies, competitor research, and user persona mapping.
                </p>
              </div>
            </div>

            {/* Help/System */}
            <div className="glow-card p-6 flex flex-col justify-between h-[220px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full text-xs font-semibold border border-cyan-500/20">
                    @help
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-100">System Command Board</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Lists active commands, shows platform usage guides, and manages workspace shortcuts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
