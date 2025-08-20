"use client";

import { useState } from "react";
import { RepoInput } from "@/components/RepoInput";
import { TreeView } from "@/components/TreeView";
import { CurlPreview } from "@/components/CurlPreview";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RepoInfo, TreeNode } from "@/lib/types";
import { fetchRepoTree, buildTreeStructure } from "@/lib/github";
import { Github } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  const handleRepoSubmit = async (repo: RepoInfo) => {
    setLoading(true);
    setSelectedNode(null);
    
    try {
      const treeData = await fetchRepoTree(repo.owner, repo.repo, repo.branch);
      const nodes = buildTreeStructure(treeData.tree);
      
      setRepoInfo(repo);
      setTreeNodes(nodes);
    } catch (error) {
      console.error('Error fetching repository:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleNodeSelect = (node: TreeNode, repo: RepoInfo) => {
    setSelectedNode(node);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">GitHub Repository Downloader</h1>
                <p className="text-sm text-muted-foreground">
                  Browse repositories and generate curl commands
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          
          <RepoInput onRepoSubmit={handleRepoSubmit} loading={loading} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Panel - Tree View */}
        <div className="w-full lg:w-1/3 lg:border-r border-b lg:border-b-0 bg-card/30 flex flex-col max-h-96 lg:max-h-none">
          <div className="p-4 border-b bg-card/50">
            <h2 className="font-semibold text-lg">Repository Tree</h2>
            <p className="text-sm text-muted-foreground">
              {treeNodes.length > 0 ? "Click on files and folders to generate curl commands" : "Enter a GitHub repository URL above to browse files"}
            </p>
          </div>
          
          <TreeView
            nodes={treeNodes}
            repoInfo={repoInfo!}
            onNodeSelect={handleNodeSelect}
            selectedPath={selectedNode?.path}
          />
        </div>

        {/* Right Panel - Curl Preview */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b bg-card/50">
            <h2 className="font-semibold text-lg">Download Commands</h2>
            <p className="text-sm text-muted-foreground">
              Ready-to-use curl commands for downloading selected content
            </p>
          </div>
          
          <div className="flex-1 p-4 min-h-0">
            <CurlPreview selectedNode={selectedNode} repoInfo={repoInfo} />
          </div>
        </div>
      </main>
    </div>
  );
}