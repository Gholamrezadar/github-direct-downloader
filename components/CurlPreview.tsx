"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Download, File, Folder } from "lucide-react";
import { TreeNode, RepoInfo } from "@/lib/types";
import { curlCommand, generateFolderCurlCommands, getAllFiles } from "@/lib/github";

interface CurlPreviewProps {
  selectedNode: TreeNode | null;
  repoInfo: RepoInfo | null;
}

export function CurlPreview({ selectedNode, repoInfo }: CurlPreviewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!selectedNode || !repoInfo) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Select a file or folder</h3>
          <p>Click on any item in the file tree to generate curl commands</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderFilePreview = () => {
    const command = curlCommand(repoInfo.owner, repoInfo.repo, repoInfo.branch, selectedNode.path);
    
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <File className="w-5 h-5 text-blue-500" />
            Download File
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedNode.path}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Curl Command:</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(command, 0)}
                className="h-8 shrink-0"
              >
                {copiedIndex === 0 ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-xs sm:text-sm break-all font-mono">{command}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFolderPreview = () => {
    const commands = generateFolderCurlCommands(repoInfo.owner, repoInfo.repo, repoInfo.branch, selectedNode);
    const files = getAllFiles(selectedNode);
    const allCommands = commands.join('\n');
    
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Folder className="w-5 h-5 text-blue-500" />
                Download Folder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedNode.path} ({files.length} files)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(allCommands)}
              className="h-8"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied All
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy All
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="text-sm font-medium mb-2">Curl Commands:</div>
          <ScrollArea className="flex-1 bg-muted rounded-md p-3">
            <div className="space-y-3">
              {commands.map((command, index) => (
                <div key={index} className="group">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-xs text-muted-foreground font-mono">
                      {files[index]}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(command, index)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 sm:transition-opacity shrink-0"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <code className="text-xs sm:text-sm break-all bg-background p-2 rounded block font-mono">
                    {command}
                  </code>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return selectedNode.type === 'blob' ? renderFilePreview() : renderFolderPreview();
}