export interface GitHubFile {
  name: string;
  path: string;
  content: string;
  size: number;
  type: 'file' | 'dir';
}

export interface RepoInfo {
  owner: string;
  repo: string;
}

export function parseRepoUrl(url: string): RepoInfo | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,
    /^([^\/]+)\/([^\/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
  }

  return null;
}

export async function fetchReadme(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubFile | null> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return {
      name: data.name,
      path: data.path,
      content,
      size: data.size,
      type: 'file',
    };
  } catch (error) {
    throw new Error(`Failed to fetch README: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchFile(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<GitHubFile | null> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.type !== 'file') {
      return null;
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return {
      name: data.name,
      path: data.path,
      content,
      size: data.size,
      type: 'file',
    };
  } catch (error) {
    throw new Error(`Failed to fetch file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchDirectory(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<GitHubFile[]> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    const files: GitHubFile[] = [];

    for (const item of data) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        const file = await fetchFile(owner, repo, item.path, token);
        if (file) {
          files.push(file);
        }
      } else if (item.type === 'dir') {
        const subFiles = await fetchDirectory(owner, repo, item.path, token);
        files.push(...subFiles);
      }
    }

    return files;
  } catch (error) {
    throw new Error(`Failed to fetch directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getDefaultBranch(
  owner: string,
  repo: string,
  token?: string
): Promise<string> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Failed to get repo info: ${response.status}`);
  }

  const data = await response.json();
  return data.default_branch || 'main';
}

export async function getLatestCommitSha(
  owner: string,
  repo: string,
  branch: string,
  token: string
): Promise<string> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Failed to get commit SHA: ${response.status}`);
  }

  const data = await response.json();
  return data.object.sha;
}

export async function createBranch(
  owner: string,
  repo: string,
  branch: string,
  baseSha: string,
  token: string
): Promise<void> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: baseSha,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create branch: ${error.message || response.status}`);
  }
}

export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  branch: string,
  token: string,
  message: string
): Promise<void> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const existingFile = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    { headers }
  );

  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch,
  };

  if (existingFile.ok) {
    const data = await existingFile.json();
    body.sha = data.sha;
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create/update file: ${error.message || response.status}`);
  }
}

export async function createPullRequest(
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string,
  token: string
): Promise<string> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title,
        body,
        head,
        base,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create PR: ${error.message || response.status}`);
  }

  const data = await response.json();
  return data.html_url;
}

