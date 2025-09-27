"use client";

import { useState } from "react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

type TreeNode = {
  name: string;
  type: 'module' | 'class' | 'function' | 'call';
  children?: TreeNode[];
  startLine?: number;
  endLine?: number;
};

type LogicTreeProps = {
  data: TreeNode[];
  onNodeSelect?: (node: TreeNode) => void;
};

export default function LogicTree({ data, onNodeSelect }: LogicTreeProps) {
  return (
    <div className="text-sm font-mono">
      {data.map((node, index) => (
        <TreeNodeComponent
          key={index}
          node={node}
          level={0}
          onSelect={onNodeSelect}
        />
      ))}
    </div>
  );
}

function TreeNodeComponent({
  node,
  level,
  onSelect,
}: {
  node: TreeNode;
  level: number;
  onSelect?: (node: TreeNode) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    onSelect?.(node);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'module':
        return 'text-blue-600';
      case 'class':
        return 'text-purple-600';
      case 'function':
        return 'text-green-600';
      case 'call':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="pl-4">
      <div
        className={`flex items-center py-1 hover:bg-gray-100 rounded cursor-pointer ${hasChildren ? 'font-semibold' : ''}`}
        onClick={handleClick}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        {hasChildren && (
          <span className="mr-1">
            {isExpanded ? (
              <ChevronDownIcon className="h-3.5 w-3.5 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-3.5 w-3.5 text-gray-500" />
            )}
          </span>
        )}
        {!hasChildren && <span className="w-4"></span>}
        <span className={`${getTypeColor(node.type)}`}>
          {node.name}
          {node.type === 'function' && node.startLine !== undefined && node.endLine !== undefined && (
            <span className="text-xs text-gray-500 ml-2">
              (lines {node.startLine}-{node.endLine})
            </span>
          )}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children?.map((child, i) => (
            <TreeNodeComponent
              key={i}
              node={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
