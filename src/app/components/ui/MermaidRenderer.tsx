"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidRendererProps {
  chart: string;
}

let uniqueIdCounter = 0;

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const containerId = useRef(`mermaid-svg-${++uniqueIdCounter}`);

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "var(--font-geist-sans), sans-serif",
          themeVariables: {
            background: "#121625",
            primaryColor: "#a855f7",
            primaryTextColor: "#f8fafc",
            lineColor: "#ff1a88",
            primaryBorderColor: "#3b82f6",
            nodeBorder: "#3b82f6",
          }
        });

        // Clean out chart syntax
        let cleanedChart = chart.trim();
        if (cleanedChart.startsWith("```mermaid")) {
          cleanedChart = cleanedChart.substring(10).replace(/\n```$/, "");
        } else if (cleanedChart.startsWith("```")) {
          cleanedChart = cleanedChart.substring(3).replace(/\n```$/, "");
        }

        const { svg: renderedSvg } = await mermaid.render(containerId.current, cleanedChart);
        
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        console.error("Mermaid rendering failed:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to parse diagram syntax");
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
        <div className="font-bold mb-1.5 flex items-center">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Diagram Parsing Error:</span>
        </div>
        {chart}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="py-8 text-center flex items-center justify-center space-x-2 text-slate-500 text-xs font-semibold">
        <div className="animate-spin w-4 h-4 border border-fuchsia-500 border-t-transparent rounded-full"></div>
        <span>Generating diagram...</span>
      </div>
    );
  }

  return (
    <div 
      ref={elementRef}
      className="p-4 bg-[#121625] border border-white/5 rounded-xl flex justify-center overflow-x-auto select-none"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
