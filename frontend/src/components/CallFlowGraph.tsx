"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

export type CallFlowGraphProps = {
  mermaidDefinition: string; // A full mermaid graph definition (e.g., graph TD; A-->B)
  className?: string;
};

export default function CallFlowGraph({ mermaidDefinition, className }: CallFlowGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "default" });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const render = async () => {
      setError(null);
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, mermaidDefinition);
        containerRef.current!.innerHTML = svg;
      } catch (e: any) {
        setError(e?.message || "Failed to render graph");
      }
    };

    render();
  }, [mermaidDefinition]);

  return (
    <div className={className}>
      {error ? (
        <div className="p-3 bg-red-50 text-red-700 rounded text-sm border border-red-200">
          {error}
        </div>
      ) : (
        <div ref={containerRef} className="w-full overflow-auto" />
      )}
    </div>
  );
}
