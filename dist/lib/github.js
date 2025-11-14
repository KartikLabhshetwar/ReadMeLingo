"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRepoUrl = parseRepoUrl;
exports.fetchReadme = fetchReadme;
exports.fetchFile = fetchFile;
exports.fetchDirectory = fetchDirectory;
exports.getDefaultBranch = getDefaultBranch;
exports.getLatestCommitSha = getLatestCommitSha;
exports.createBranch = createBranch;
exports.createOrUpdateFile = createOrUpdateFile;
exports.createPullRequest = createPullRequest;
function parseRepoUrl(url) {
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
async function fetchReadme(owner, repo, token) {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
        if (!response.ok) {
            if (response.status === 404)
                return null;
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
    }
    catch (error) {
        throw new Error(`Failed to fetch README: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function fetchFile(owner, repo, path, token) {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
        if (!response.ok) {
            if (response.status === 404)
                return null;
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
    }
    catch (error) {
        throw new Error(`Failed to fetch file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function fetchDirectory(owner, repo, path, token) {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
        if (!response.ok) {
            if (response.status === 404)
                return [];
            throw new Error(`GitHub API error: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            return [];
        }
        const files = [];
        for (const item of data) {
            if (item.type === 'file' && item.name.endsWith('.md')) {
                const file = await fetchFile(owner, repo, item.path, token);
                if (file) {
                    files.push(file);
                }
            }
            else if (item.type === 'dir') {
                const subFiles = await fetchDirectory(owner, repo, item.path, token);
                files.push(...subFiles);
            }
        }
        return files;
    }
    catch (error) {
        throw new Error(`Failed to fetch directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function getDefaultBranch(owner, repo, token) {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!response.ok) {
        throw new Error(`Failed to get repo info: ${response.status}`);
    }
    const data = await response.json();
    return data.default_branch || 'main';
}
async function getLatestCommitSha(owner, repo, branch, token) {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
    };
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, { headers });
    if (!response.ok) {
        throw new Error(`Failed to get commit SHA: ${response.status}`);
    }
    const data = await response.json();
    return data.object.sha;
}
async function createBranch(owner, repo, branch, baseSha, token) {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            ref: `refs/heads/${branch}`,
            sha: baseSha,
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create branch: ${error.message || response.status}`);
    }
}
async function createOrUpdateFile(owner, repo, path, content, branch, token, message) {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    const existingFile = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers });
    const body = {
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
    };
    if (existingFile.ok) {
        const data = await existingFile.json();
        body.sha = data.sha;
    }
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create/update file: ${error.message || response.status}`);
    }
}
async function createPullRequest(owner, repo, title, body, head, base, token) {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            title,
            body,
            head,
            base,
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create PR: ${error.message || response.status}`);
    }
    const data = await response.json();
    return data.html_url;
}
