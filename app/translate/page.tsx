'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileSelector } from '@/components/file-selector';
import { LanguageSelector } from '@/components/language-selector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

function TranslateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [files, setFiles] = useState<Array<{ name: string; path: string; size: number; content: string }>>([]);
  const [token, setToken] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['es', 'fr', 'de']);
  const [loading, setLoading] = useState(false);
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
          
          if (data.files && Array.isArray(data.files)) {
            setFiles(data.files);
            setSelectedFiles(data.files.map((f: { path: string }) => f.path));
          }
          
          sessionStorage.removeItem(sessionKey);
        } else {
          setError('Session data not found. Please try fetching the repository again.');
        }
      } catch (err) {
        setError('Failed to load repository data. Please try again.');
        console.error('Error loading session data:', err);
      }
    } else {
      setError('No session data provided. Please start from the home page.');
    }
  }, [searchParams]);

  const handleTranslate = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    if (selectedLanguages.length === 0) {
      setError('Please select at least one language');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filesToTranslate = files.filter(f => selectedFiles.includes(f.path));

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToTranslate,
          targetLocales: selectedLanguages,
          sourceLocale: 'en',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to translate files');
      }

      const sessionKey = `readmelingo_preview_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      sessionStorage.setItem(sessionKey, JSON.stringify({
        owner,
        repo,
        token,
        originalFiles: filesToTranslate,
        translatedFiles: result.translatedFiles,
      }));

      router.push(`/preview?session=${sessionKey}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  if (!owner || !repo || files.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No repository data found</p>
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
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {owner}/{repo}
          </h1>
          <p className="text-muted-foreground">
            Select files and languages to translate
          </p>
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <FileSelector
              files={files}
              selectedFiles={selectedFiles}
              onSelectionChange={setSelectedFiles}
            />
          </Card>

          <Card className="p-6">
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onSelectionChange={setSelectedLanguages}
            />
          </Card>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleTranslate}
              disabled={loading || selectedFiles.length === 0 || selectedLanguages.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                'Translate Files'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TranslatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <TranslateContent />
    </Suspense>
  );
}

