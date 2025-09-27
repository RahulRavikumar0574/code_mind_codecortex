"use client";

import { useState } from "react";
import { CodeBracketIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import api from "@/lib/api";

type Suggestion = {
  file: string;
  line: number;
  context: string;
  explanation: string;
  codeSnippet: string;
};

type SnippetIntegrationProps = {
  logicTree: any[];
  onClose?: () => void;
};

export default function SnippetIntegration({ logicTree, onClose }: SnippetIntegrationProps) {
  const [code, setCode] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/snippet", {
        snippet: code,
        logicTree,
      });

      setSuggestions(response.data.suggestions);
      if (response.data.suggestions.length > 0) {
        setActiveSuggestion(0);
      }
    } catch (err: any) {
      console.error("Error getting snippet suggestions:", err);
      setError(
        err.response?.data?.error || "Failed to get integration suggestions. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <CodeBracketIcon className="h-5 w-5 mr-2" />
          Snippet Integration
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
            aria-label="Close snippet integration"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="code-snippet" className="block text-sm font-medium text-gray-700 mb-1">
                Paste your code snippet
              </label>
              <div className="relative">
                <textarea
                  id="code-snippet"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code snippet here..."
                  className="w-full h-40 p-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!code.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <LightBulbIcon className="h-4 w-4 mr-2" />
                    Find Integration Points
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            <p>{error}</p>
          </div>
        )}

        {suggestions && suggestions.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              {suggestions.length} integration suggestion{suggestions.length !== 1 ? 's' : ''} found:
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Suggestion list */}
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSuggestion(index)}
                    className={`w-full text-left p-3 rounded-lg border ${
                      activeSuggestion === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm truncate">
                      {suggestion.file}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Line {suggestion.line}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Active suggestion details */}
              {activeSuggestion !== null && (
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Context</h5>
                    <p className="text-sm text-gray-700">{suggestions[activeSuggestion].explanation}</p>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 text-xs text-gray-600 border-b">
                      {suggestions[activeSuggestion].file} (around line {suggestions[activeSuggestion].line})
                    </div>
                    <div className="max-h-64 overflow-auto">
                      <SyntaxHighlighter
                        language={suggestions[activeSuggestion].file.split('.').pop() || 'text'}
                        style={vscDarkPlus}
                        showLineNumbers
                        wrapLines
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          fontSize: '0.875rem',
                        }}
                        lineNumberStyle={{
                          minWidth: '2.25em',
                          paddingRight: '1em',
                          color: '#6B7280',
                          textAlign: 'right',
                        }}
                      >
                        {suggestions[activeSuggestion].context}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => {
                        // This would be implemented to integrate the snippet
                        alert('Snippet integration would be implemented here');
                      }}
                    >
                      Integrate Snippet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : suggestions?.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <LightBulbIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <h4 className="font-medium text-gray-900">No integration points found</h4>
            <p className="text-sm text-gray-500 mt-1">
              Try a different code snippet or check if the code is related to the project.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
