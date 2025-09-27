"use client";

import { useMemo, useState } from "react";

// Import Components
import FileUploader from "@/components/FileUploader";
import FileTree from "@/components/FileTree";
import LogicTree from "@/components/LogicTree";
import LintPanel from "@/components/LintPanel";
import CallFlowGraph from "@/components/CallFlowGraph";
import SnippetIntegration from "@/components/SnippetIntegration";
import OptimizePanel from "@/components/OptimizePanel";
import ChatWindow from "@/components/ChatWindow";
import { UploadResponse } from "@/types";

type Tab = "upload" | "files" | "logic" | "flow" | "lint" | "optimize" | "snippet" | "chat";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("upload");

  const handleUploaded = (response: UploadResponse, uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    setUploadData(response);
    setActiveTab("files"); // Switch to file tree after upload
  };

  const mermaidDefinition = useMemo(() => {
    // Fallback diagram if nothing uploaded yet
    if (!uploadData?.logicTree?.length) return "graph LR; A[No Data]-->B[Upload a project]";

    // Mermaid v10-safe generation: only nodes and edges, sanitized IDs, no subgraphs
    const nodes = new Set<string>();
    const edges = new Set<string>();

    const id = (s: string) => String(s).replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 60);
    const label = (s: string) => String(s).replace(/[\[\]]/g, '');

    const addNode = (nodeId: string, text: string) => nodes.add(`${nodeId}[${label(text)}]`);

    const walk = (node: any, fileName?: string) => {
      if (!node) return;
      const name = node.name || 'unknown';
      const nodeId = id((fileName ? fileName + '_' : '') + name);

      if (node.type === 'module') {
        addNode(nodeId, name);
        (node.children || []).forEach((ch: any) => {
          const childId = id(name + '_' + (ch.name || ch.type));
          if (ch.type === 'function') {
            addNode(childId, ch.name);
            edges.add(`${nodeId}-->${childId}`);
          }
          walk(ch, name);
        });
        return;
      }

      if (node.type === 'function') {
        (node.children || []).forEach((ch: any) => {
          if (ch.type === 'call' && ch.name) {
            const callId = id('call_' + ch.name);
            addNode(callId, ch.name);
            edges.add(`${nodeId}-->${callId}`);
          }
        });
      }

      (node.children || []).forEach((ch: any) => walk(ch, fileName));
    };

    uploadData.logicTree.forEach((fileNode: any) => walk(fileNode));

    return `graph LR\n${Array.from(nodes).join('\n')}\n${Array.from(edges).join('\n')}`;
  }, [uploadData]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "files", label: "File Explorer" },
    { key: "logic", label: "Logic Tree" },
    { key: "flow", label: "Call Flow" },
    { key: "lint", label: "Lint" },
    { key: "optimize", label: "Optimize" },
    { key: "snippet", label: "Snippet Integration" },
    { key: "chat", label: "AI Assistant" },
  ];

  const renderContent = () => {
    // Allow AI Assistant even without upload; keep guard for other tabs
    if (!uploadData && activeTab !== 'upload' && activeTab !== 'chat') {
        return (
            <div className="text-center text-gray-500 py-16">
                <p>Please upload a project first.</p>
            </div>
        )
    }

    switch (activeTab) {
      case "upload":
        return <FileUploader onUploaded={handleUploaded} />;
      case "files":
        return <FileTree data={uploadData?.structure || []} />;
      case "logic":
        return <LogicTree data={uploadData?.logicTree || []} />;
      case "flow":
        return <CallFlowGraph mermaidDefinition={mermaidDefinition} />;
      case "lint":
        return <LintPanel files={files} />;
      case "optimize":
        return <OptimizePanel files={files} />;
      case "snippet":
        return <SnippetIntegration logicTree={uploadData?.logicTree || []} />;
      case "chat":
        return <ChatWindow files={files} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">CodeCortex</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Your AI-powered code analysis and visualization partner.</p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6 overflow-x-auto px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${
                    activeTab === tab.key
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {renderContent()}
          </div>
        </div>

        <footer className="text-center mt-10 text-sm text-gray-500 dark:text-gray-400">
            <p>Powered by Cascade AI</p>
        </footer>
      </div>
    </main>
  );
}