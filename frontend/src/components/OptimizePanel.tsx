"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import CodeEditor from "./CodeEditor";

interface OptimizePanelProps {
  files: File[];
}

export default function OptimizePanel({ files }: OptimizePanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ optimizedCode: string; message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onOptimize = async () => {
    if (!selectedFile) {
      setError("Please select a file to optimize.");
      return;
    }

    const reader = new FileReader();
    reader.readAsText(selectedFile);
    reader.onload = async (e) => {
      const code = e.target?.result as string;
      if (!code) return;

      try {
        setLoading(true);
        setError(null);
        const res = await api.post("/optimize", {
          code: code,
          fileName: selectedFile.name,
        });
        setResult(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Optimization failed");
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <select
          onChange={(e) => {
            const file = files.find(f => f.name === e.target.value);
            setSelectedFile(file || null);
          }}
          className="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">-- Select a file to optimize --</option>
          {files.map(f => (
            <option key={f.name} value={f.name}>{f.name}</option>
          ))}
        </select>
        <button
          onClick={onOptimize}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          disabled={loading || !selectedFile}
        >
          {loading ? "Optimizing..." : "Run Optimize"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {result && (
        <div>
          <h3 className="font-semibold mb-2">Optimized Code:</h3>
          <p className="text-sm text-gray-500 mb-2">{result.message}</p>
          <div className="h-96">
             <CodeEditor code={result.optimizedCode} language="python" readOnly />
          </div>
        </div>
      )}
    </div>
  );
}
