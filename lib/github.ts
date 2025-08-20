import { GitTreeResponse, TreeNode, RepoInfo } from './types';

export function parseGitHubUrl(url: string, branch: string): RepoInfo | null {
  try {
    // Handle shorthand format: owner/repo
    if (!url.includes('://') && url.includes('/')) {
      const parts = url.trim().split('/').filter(Boolean);
      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1],
          branch: branch
        };
      }
      return null;
    }
    
    // Handle full URL format
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) return null;
    
    return {
      owner: pathParts[0],
      repo: pathParts[1],
      branch: branch
    };
  } catch {
    // If URL parsing fails, try shorthand format as fallback
    const trimmed = url.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1],
          branch: branch
        };
      }
    }
    return null;
  }
}

export async function fetchRepoTree(owner: string, repo: string, branch = "main"): Promise<GitTreeResponse> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Repository not found. Please check the URL and make sure the repository is public.");
    }
    throw new Error(`Failed to fetch repository tree: ${res.statusText}`);
  }
  return res.json();
}

export function buildTreeStructure(entries: any[]): TreeNode[] {
  const root: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();
  
  // Sort entries to ensure directories come before their contents
  const sortedEntries = entries.sort((a, b) => {
    const aDepth = a.path.split('/').length;
    const bDepth = b.path.split('/').length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.path.localeCompare(b.path);
  });
  
  for (const entry of sortedEntries) {
    const parts = entry.path.split('/');
    const name = parts[parts.length - 1];
    
    const node: TreeNode = {
      name,
      path: entry.path,
      type: entry.type,
      children: entry.type === 'tree' ? [] : undefined,
      isExpanded: false
    };
    
    nodeMap.set(entry.path, node);
    
    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      const parent = nodeMap.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    }
  }
  
  return root;
}

export function rawFileUrl(owner: string, repo: string, branch: string, path: string): string {
  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/refs/heads/${encodeURIComponent(branch)}/${encodedPath}`;
}

export function curlCommand(owner: string, repo: string, branch: string, path: string): string {
  const url = rawFileUrl(owner, repo, branch, path);
  return `curl -L "${url}" --create-dirs -o "${path}"`;
}

export function getAllFiles(node: TreeNode): string[] {
  const files: string[] = [];
  
  if (node.type === 'blob') {
    files.push(node.path);
  } else if (node.children) {
    for (const child of node.children) {
      files.push(...getAllFiles(child));
    }
  }
  
  return files;
}

export function generateFolderCurlCommands(owner: string, repo: string, branch: string, folderNode: TreeNode): string[] {
  const files = getAllFiles(folderNode);
  return files.map(filePath => curlCommand(owner, repo, branch, filePath));
}