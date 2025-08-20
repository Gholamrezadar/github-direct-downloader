export interface GitTreeEntry {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitTreeResponse {
  sha: string;
  url: string;
  tree: GitTreeEntry[];
  truncated: boolean;
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  children?: TreeNode[];
  isExpanded?: boolean;
}

export interface RepoInfo {
  owner: string;
  repo: string;
  branch: string;
}