"use client";

import { useState } from "react";
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, DocumentIcon } from "@heroicons/react/24/outline";

export type FileNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
};

interface FileTreeProps {
  data: FileNode[];
  onFileSelect?: (file: FileNode) => void;
}

export default function FileTree({ data, onFileSelect }: FileTreeProps) {
  return (
    <div className="text-sm">
      {data?.length ? (
        data.map((node, idx) => <TreeItem key={idx} node={node} level={0} onFileSelect={onFileSelect} />)
      ) : (
        <p className="text-gray-500">No files to display.</p>
      )}
    </div>
  );
}

function TreeItem({ node, level, onFileSelect }: { node: FileNode; level: number; onFileSelect?: (file: FileNode) => void; }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.type === "directory" && (node.children?.length ?? 0) > 0;

  const handleClick = () => {
    if (node.type === 'file') {
      onFileSelect?.(node);
    } else {
      setOpen((o) => !o);
    }
  };

  return (
    <div style={{ paddingLeft: `${level * 12}px` }}>
      <div
        className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-100 rounded px-1"
        onClick={handleClick}
      >
        {hasChildren ? (
          open ? (
            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-gray-500" />
          )
        ) : (
          <span className="w-4" />
        )}
        {node.type === "directory" ? (
          <FolderIcon className="h-4 w-4 text-amber-600" />
        ) : (
          <DocumentIcon className="h-4 w-4 text-gray-500" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {hasChildren && open && (
        <div>
          {node.children!.map((child, i) => (
            <TreeItem key={i} node={child} level={level + 1} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
