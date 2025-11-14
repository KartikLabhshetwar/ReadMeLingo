'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarkdownViewer } from './markdown-viewer';
import { Copy, Download, Check } from 'lucide-react';

interface TranslatedFile {
  path: string;
  locale: string;
  content: string;
}

interface OriginalFile {
  path: string;
  content: string;
}

interface TranslationPreviewProps {
  originalFiles: OriginalFile[];
  translatedFiles: TranslatedFile[];
  onDownloadFile: (path: string, content: string) => void;
}

export function TranslationPreview({
  originalFiles,
  translatedFiles,
  onDownloadFile,
}: TranslationPreviewProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopy = async (content: string, path: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const groupedFiles = originalFiles.map(original => {
    const translations = translatedFiles.filter(t => 
      t.path.startsWith(original.path.replace(/\.md$/, ''))
    );
    return { original, translations };
  });

  return (
    <div className="space-y-6">
      {groupedFiles.map(({ original, translations }) => (
        <Card key={original.path} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{original.path}</h3>
          
          <Tabs defaultValue="original" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
              <TabsTrigger value="original">Original</TabsTrigger>
              {translations.map(t => (
                <TabsTrigger key={t.locale} value={t.locale}>
                  {t.locale}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="original" className="space-y-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(original.content, original.path)}
                >
                  {copiedPath === original.path ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDownloadFile(original.path, original.content)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                <MarkdownViewer content={original.content} />
              </div>
            </TabsContent>

            {translations.map(translation => (
              <TabsContent key={translation.locale} value={translation.locale} className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(translation.content, translation.path)}
                  >
                    {copiedPath === translation.path ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownloadFile(translation.path, translation.content)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <MarkdownViewer content={translation.content} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      ))}
    </div>
  );
}

