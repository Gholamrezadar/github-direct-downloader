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
      <header className="bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                <a href="https://github.com/gholamrezadar/github-direct-downloader"><Github className="w-6 h-6" /></a>
              </div>
              <div>
                <h1 className="text-2xl font-bold">GitHub Direct Downloader</h1>
                <p className="text-sm text-muted-foreground hidden md:block">
                  Download a specific folder from a GitHub repository
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          
          <RepoInput onRepoSubmit={handleRepoSubmit} loading={loading} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 container mx-auto px-4 box-border mb-4">
        {/* Left Panel - Tree View */}
        <div className="w-full lg:w-1/3 border bg-card/30 flex flex-col max-h-96 lg:max-h-none pb-8 lg:pb-0">
          <div className="p-4 border-b bg-card/50 mb-16 lg:m-0">
            <h2 className="font-semibold text-lg">Repository Tree</h2>
            <p className="text-sm text-muted-foreground hidden xl:block ">
              {treeNodes.length > 0 ? "Click on files and folders to generate curl commands" : "Enter a GitHub repository URL above to view the repository"}
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
        <div className="flex-1 flex flex-col border border-t-0 lg:border-t lg:border-l-0 mb-8 lg:m-0">
          <div className="p-4 border-b bg-card/50">
            <h2 className="font-semibold text-lg">Download Commands</h2>
            <p className="text-sm text-muted-foreground hidden xl:block">
              Ready-to-use curl commands for downloading selected content
            </p>
          </div>
          
          <div className="flex-1 p-4 min-h-0 flex justify-center items-center">
            <CurlPreview selectedNode={selectedNode} repoInfo={repoInfo} />
          </div>
        </div>
      </main>
    </div>
  );
}