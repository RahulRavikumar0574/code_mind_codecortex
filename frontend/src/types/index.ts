export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export interface LogicNode {
  name: string;
  type: 'module' | 'class' | 'function' | 'call';
  children?: LogicNode[];
  startLine?: number;
  endLine?: number;
  // Adding other potential fields from backend
  file?: string;
  functions?: string[];
  calls?: string[];
}

export interface UploadResponse {
  structure: FileNode[];
  logicTree: LogicNode[];
}

export interface LintResult {
  file: string;
  success: boolean;
  message?: string;
  details?: unknown;
}

export interface OptimizeResult {
  success: boolean;
  optimizedCode?: string;
  error?: string;
}