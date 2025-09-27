"use client";

import Editor, { OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  language: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  code,
  language,
  onCodeChange,
  readOnly = false,
}: CodeEditorProps) {

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // You can add custom editor configurations here
    monaco.editor.setTheme('vs-dark');
  };

  return (
    <div className="h-full w-full border border-gray-700 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={(value) => onCodeChange?.(value || '')}
        onMount={handleEditorDidMount}
        options={{
          readOnly: readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
