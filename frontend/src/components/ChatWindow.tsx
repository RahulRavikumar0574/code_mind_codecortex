"use client";

import { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import api from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatWindowProps = {
  codeSnippet?: string;
  filePath?: string;
  files?: File[]; // uploaded files available from the page
  onClose?: () => void;
};

export default function ChatWindow({ codeSnippet, filePath, files, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (codeSnippet && filePath) {
      const initialMessage: Message = {
        role: "assistant",
        content: `I'm analyzing the code in ${filePath}. How can I help you understand it?`,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [codeSnippet, filePath]);

  // When user selects a file from uploaded files, load its content automatically
  useEffect(() => {
    if (!files || files.length === 0 || !selectedFileName) return;
    const f = files.find((x) => x.name === selectedFileName);
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => setCodeInput((e.target?.result as string) || "");
    reader.readAsText(f);
  }, [files, selectedFileName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const codeToSend = codeSnippet ?? codeInput;
    if (!codeToSend || codeToSend.trim().length === 0) {
      setError("Please paste code above or open a file before asking a question.");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/explain", {
        code: codeToSend,
        filePath,
        question: input,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.explanation,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error getting explanation:", error);
      const apiMsg = error?.response?.data?.error;
      const errorMessage: Message = {
        role: "assistant",
        content: apiMsg || "Sorry, I couldn't process your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <h3 className="font-medium">Code Assistant</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
            aria-label="Close chat"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Prefer using uploaded files if available */}
        {!codeSnippet && (
          <div className="space-y-2">
            {files && files.length > 0 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Select a file to analyze</label>
                <select
                  value={selectedFileName}
                  onChange={(e) => setSelectedFileName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                >
                  <option value="">-- Choose a file --</option>
                  {files.map((f) => (
                    <option key={f.name} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Paste code to analyze</label>
                <textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Paste a code snippet here..."
                  className="w-full h-32 p-3 font-mono text-sm border border-gray-300 rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        )}
        {messages.length === 0 ? (
          <div className="text-center text-gray-700 dark:text-gray-300 mt-8">
            <p>Ask me anything about this code!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  {message.role === "user" ? "You" : "Assistant"} • {formatTime(message.timestamp)}
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3 bg-gray-50 dark:bg-gray-900">
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this code..."
            className="flex-1 px-4 py-2 border rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
