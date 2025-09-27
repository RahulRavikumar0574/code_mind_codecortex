"use client";

import React, { useState } from "react";
import api from "@/lib/api";

type LintResult = {
  file: string;
  success: boolean;
  message?: string;
  details?: unknown;
};

type Props = {
  files: File[];
};

export default function LintPanel({ files }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LintResult[] | null>(null);

  const onLint = async () => {
    if (!files || files.length === 0) {
      setError("No files selected. Upload files first.");
      return;
    }
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    try {
      setLoading(true);
      const res = await api.post<{ lintResults: LintResult[] }>("/lint", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data.lintResults);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      const msg = e?.response?.data?.error || e?.message || "Lint failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded border p-4 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Lint</h2>
        <button
          onClick={onLint}
          className="px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Linting..." : "Run Lint"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {results ? (
        <div className="space-y-3">
          {results.map((r, idx) => {
            const ok = !!r.success;
            const card = ok ?
              "bg-green-50 border-green-300 text-green-900" :
              "bg-red-50 border-red-300 text-red-900";
            const badge = ok ?
              "bg-green-600 text-white" :
              "bg-red-600 text-white";
            const detailsText: string | null = r.details !== undefined && r.details !== null
              ? (typeof r.details === 'string' ? (r.details as string) : JSON.stringify(r.details, null, 2))
              : null;
            return (
              <div key={idx} className={`border rounded p-3 ${card}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium truncate">{r.file}</div>
                  <span className={`text-xs px-2 py-0.5 rounded ${badge}`}>{ok ? "PASS" : "FAIL"}</span>
                </div>
                {r.message && (
                  <div className="text-sm mb-2">{r.message}</div>
                )}
                {detailsText && (
                  <pre className="text-xs bg-white/70 dark:bg-black/30 border rounded p-2 overflow-auto max-h-56 whitespace-pre-wrap">
                    {detailsText}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        !error && <p className="text-sm text-gray-600 dark:text-gray-400">Run lint to see results.</p>
      )}
    </div>
  );
}