import { NextRequest, NextResponse } from 'next/server';
import { parseRepoUrl, fetchReadme, fetchFile, fetchDirectory, GitHubFile } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl, token, includeContributing, includeDocs } = body;

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) {
      return NextResponse.json(
        { error: 'Invalid repository URL' },
        { status: 400 }
      );
    }

    const { owner, repo } = repoInfo;
    const files: GitHubFile[] = [];

    const readme = await fetchReadme(owner, repo, token);
    if (readme) {
      files.push(readme);
    }

    if (includeContributing) {
      const contributing = await fetchFile(owner, repo, 'CONTRIBUTING.md', token);
      if (contributing) {
        files.push(contributing);
      }
    }

    if (includeDocs) {
      try {
        const docsFiles = await fetchDirectory(owner, repo, 'docs', token);
        files.push(...docsFiles);
      } catch (error) {
        console.warn('No docs directory found or accessible');
      }
    }

    return NextResponse.json({
      success: true,
      owner,
      repo,
      files: files.map(f => ({
        name: f.name,
        path: f.path,
        content: f.content,
        size: f.size,
      })),
    });
  } catch (error) {
    console.error('Error fetching repository files:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch repository files',
      },
      { status: 500 }
    );
  }
}

