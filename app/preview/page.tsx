'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TranslationPreview } from '@/components/translation-preview';
import { CreatePRDialog } from '@/components/create-pr-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, GitPullRequest, Loader2 } from 'lucide-react';

interface TranslatedFile {
  path: string;
  locale: string;
  content: string;
}

interface OriginalFile {
  path: string;
  content: string;
  name: string;
  size: number;
}

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [token, setToken] = useState('');
  const [originalFiles, setOriginalFiles] = useState<OriginalFile[]>([]);
  const [translatedFiles, setTranslatedFiles] = useState<TranslatedFile[]>([]);
  const [prDialogOpen, setPrDialogOpen] = useState(false);
  const [prLoading, setPrLoading] = useState(false);
  const [prSuccess, setPrSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionKey = searchParams.get('session');
    
    if (sessionKey) {
      try {
        const sessionData = sessionStorage.getItem(sessionKey);
        if (sessionData) {
          const data = JSON.parse(sessionData);
          setOwner(data.owner || '');
          setRepo(data.repo || '');
          setToken(data.token || '');
          
          if (data.originalFiles && Array.isArray(data.originalFiles)) {
            setOriginalFiles(data.originalFiles);
          }
          
          if (data.translatedFiles && Array.isArray(data.translatedFiles)) {
            setTranslatedFiles(data.translatedFiles);
          }
          
          sessionStorage.removeItem(sessionKey);
        } else {
          setError('Session data not found. Please try translating again.');
        }
      } catch (err) {
        setError('Failed to load translation data. Please try again.');
        console.error('Error loading session data:', err);
      }
    } else {
      setError('No session data provided. Please start from the home page.');
    }
  }, [searchParams]);

  const handleDownloadFile = (path: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || 'file.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      const allFiles = [
        ...originalFiles.map(f => ({ path: f.path, content: f.content })),
        ...translatedFiles,
      ];

      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: allFiles,
          filename: `${owner}-${repo}-translations.zip`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create ZIP file');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${owner}-${repo}-translations.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download ZIP');
    }
  };

  const handleCreatePR = async (data: {
    branchName: string;
    prTitle: string;
    prBody: string;
    token: string;
  }) => {
    setPrLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          translatedFiles,
          branchName: data.branchName,
          prTitle: data.prTitle,
          prBody: data.prBody,
          token: data.token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create pull request');
      }

      setPrSuccess(result.prUrl);
      setPrDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pull request');
    } finally {
      setPrLoading(false);
    }
  };

  if (!owner || !repo || originalFiles.length === 0 || translatedFiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No translation data found</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Translation Preview
          </h1>
          <p className="text-muted-foreground">
            {owner}/{repo} - {translatedFiles.length} translations generated
          </p>
        </div>

        {prSuccess && (
          <Card className="p-4 mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Pull Request Created Successfully!
                </p>
                <a
                  href={prSuccess}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 dark:text-green-300 hover:underline"
                >
                  View Pull Request →
                </a>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-3">
          <Button onClick={handleDownloadZip}>
            <Download className="mr-2 h-4 w-4" />
            Download All as ZIP
          </Button>
          <Button variant="outline" onClick={() => setPrDialogOpen(true)}>
            <GitPullRequest className="mr-2 h-4 w-4" />
            Create Pull Request
          </Button>
        </div>

        <TranslationPreview
          originalFiles={originalFiles}
          translatedFiles={translatedFiles}
          onDownloadFile={handleDownloadFile}
        />

        <CreatePRDialog
          open={prDialogOpen}
          onOpenChange={setPrDialogOpen}
          onSubmit={handleCreatePR}
          loading={prLoading}
          defaultToken={token}
        />
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}

