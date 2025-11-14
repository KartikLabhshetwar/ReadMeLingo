'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RepoInput } from '@/components/repo-input';
import { Card } from '@/components/ui/card';
import { Github } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (data: {
    repoUrl: string;
    includeContributing: boolean;
    includeDocs: boolean;
    token?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fetch-readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch repository');
      }

      const sessionKey = `readmelingo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      sessionStorage.setItem(sessionKey, JSON.stringify({
        owner: result.owner,
        repo: result.repo,
        files: result.files,
        token: data.token || '',
      }));

      router.push(`/translate?session=${sessionKey}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Github className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            ReadMeLingo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Instantly translate your GitHub repository documentation into multiple languages using Lingo.dev
          </p>
        </div>

        <Card className="p-8 mb-8">
          <RepoInput onFetch={handleFetch} loading={loading} />
          
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}
        </Card>

        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">1</div>
            <h3 className="font-semibold">Enter Repo URL</h3>
            <p className="text-sm text-muted-foreground">
              Paste your GitHub repository URL
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">2</div>
            <h3 className="font-semibold">Select Languages</h3>
            <p className="text-sm text-muted-foreground">
              Choose target languages for translation
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">3</div>
            <h3 className="font-semibold">Get Translations</h3>
            <p className="text-sm text-muted-foreground">
              Download or create a PR instantly
            </p>
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Powered by <a href="https://lingo.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Lingo.dev</a></p>
        </div>
      </div>
    </div>
  );
}
