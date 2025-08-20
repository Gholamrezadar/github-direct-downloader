"use client";

import { useState } from "react";
import { TreeNode, RepoInfo } from "@/lib/types";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TreeViewProps {
  nodes: TreeNode[];
  repoInfo: RepoInfo;
  onNodeSelect: (node: TreeNode, repoInfo: RepoInfo) => void;
  selectedPath?: string;
}

interface TreeNodeProps {
  node: TreeNode;
  depth: number;
  repoInfo: RepoInfo;
  onNodeSelect: (node: TreeNode, repoInfo: RepoInfo) => void;
  selectedPath?: string;
}

function TreeNodeComponent({ node, depth, repoInfo, onNodeSelect, selectedPath }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedPath === node.path;
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    if (node.type === 'tree' && hasChildren) {
      setIsExpanded(!isExpanded);
    }
    onNodeSelect(node, repoInfo);
  };

  const getIcon = () => {
    if (node.type === 'tree') {
      if (hasChildren && isExpanded) {
        return <FolderOpen className="w-4 h-4 text-blue-500" />;
      }
      return <Folder className="w-4 h-4 text-blue-500" />;
    }
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  const getChevron = () => {
    if (node.type === 'tree' && hasChildren) {
      return isExpanded ? 
        <ChevronDown className="w-4 h-4 text-muted-foreground" /> : 
        <ChevronRight className="w-4 h-4 text-muted-foreground" />;
    }
    return <div className="w-4 h-4" />;
  };

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start h-8 px-2 py-1 font-normal transition-all hover:bg-accent/50",
          isSelected && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {getChevron()}
          {getIcon()}
          <span className="truncate text-sm">{node.name}</span>
        </div>
      </Button>
      
      {node.type === 'tree' && hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNodeComponent
              key={`${child.path}-${index}`}
              node={child}
              depth={depth + 1}
              repoInfo={repoInfo}
              onNodeSelect={onNodeSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeView({ nodes, repoInfo, onNodeSelect, selectedPath }: TreeViewProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No files found in this repository</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-2">
        <div className="text-sm font-semibold text-muted-foreground mb-2 px-2">
          {repoInfo.owner}/{repoInfo.repo}
        </div>
        {nodes.map((node, index) => (
          <TreeNodeComponent
            key={`${node.path}-${index}`}
            node={node}
            depth={0}
            repoInfo={repoInfo}
            onNodeSelect={onNodeSelect}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </div>
  );
}