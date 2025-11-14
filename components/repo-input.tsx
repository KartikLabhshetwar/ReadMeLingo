'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface RepoInputProps {
  onFetch: (data: {
    repoUrl: string;
    includeContributing: boolean;
    includeDocs: boolean;
    token?: string;
  }) => void;
  loading?: boolean;
}

export function RepoInput({ onFetch, loading = false }: RepoInputProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [includeContributing, setIncludeContributing] = useState(false);
  const [includeDocs, setIncludeDocs] = useState(false);
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl.trim()) {
      return;
    }

    onFetch({
      repoUrl: repoUrl.trim(),
      includeContributing,
      includeDocs,
      token: token.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="repo-url">GitHub Repository URL</Label>
        <Input
          id="repo-url"
          type="text"
          placeholder="https://github.com/owner/repo or owner/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="contributing"
            checked={includeContributing}
            onCheckedChange={(checked) => setIncludeContributing(checked as boolean)}
            disabled={loading}
          />
          <Label htmlFor="contributing" className="font-normal cursor-pointer">
            Include CONTRIBUTING.md
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="docs"
            checked={includeDocs}
            onCheckedChange={(checked) => setIncludeDocs(checked as boolean)}
            disabled={loading}
          />
          <Label htmlFor="docs" className="font-normal cursor-pointer">
            Include /docs folder
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="token">GitHub Token (Optional)</Label>
        <Input
          id="token"
          type="password"
          placeholder="ghp_xxxxxxxxxxxx"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground">
          Required for private repos and PR creation
        </p>
      </div>

      <Button type="submit" disabled={loading || !repoUrl.trim()} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Fetching...
          </>
        ) : (
          'Fetch Documentation'
        )}
      </Button>
    </form>
  );
}

