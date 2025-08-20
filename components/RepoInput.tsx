"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseGitHubUrl } from "@/lib/github";
import { RepoInfo } from "@/lib/types";
import { Github, Loader2 } from "lucide-react";

interface RepoInputProps {
  onRepoSubmit: (repoInfo: RepoInfo) => Promise<void>;
  loading: boolean;
}

export function RepoInput({ onRepoSubmit, loading }: RepoInputProps) {
  const [url, setUrl] = useState("");
  const [branch, setBranch] = useState("main")
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!url.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }
    
    const repoInfo = parseGitHubUrl(url.trim(), branch.trim());
    if (!repoInfo) {
      setError("Invalid GitHub repository. Please enter either 'owner/repo' or 'https://github.com/owner/repo'");
      return;
    }
    
    try {
      await onRepoSubmit(repoInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch repository");
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-2">
        <div className="relative flex-1 flex flex-row">
          <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="owner/repository"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mr-2 flex-grow pl-10 transition-all"
            disabled={loading}
          />
          <Input
            type="text"
            placeholder="branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-28 transition-all"
            disabled={loading}
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading}
          className="transition-all hover:scale-105 w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            "Load Repository"
          )}
        </Button>
      </form>
      
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-2">
          {error}
        </div>
      )}
    </div>
  );
}