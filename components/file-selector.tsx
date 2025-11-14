'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { formatFileSize } from '@/lib/markdown';

interface FileItem {
  name: string;
  path: string;
  size: number;
  content: string;
}

interface FileSelectorProps {
  files: FileItem[];
  selectedFiles: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function FileSelector({ files, selectedFiles, onSelectionChange }: FileSelectorProps) {
  const handleToggle = (path: string) => {
    if (selectedFiles.includes(path)) {
      onSelectionChange(selectedFiles.filter(p => p !== path));
    } else {
      onSelectionChange([...selectedFiles, path]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(files.map(f => f.path));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Files to Translate</h3>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-sm text-primary hover:underline"
        >
          {selectedFiles.length === files.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-2">
        {files.map((file) => (
          <Card key={file.path} className="p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id={file.path}
                checked={selectedFiles.includes(file.path)}
                onCheckedChange={() => handleToggle(file.path)}
              />
              <div className="flex-1 space-y-1">
                <Label htmlFor={file.path} className="font-medium cursor-pointer">
                  {file.name}
                </Label>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{file.path}</span>
                  <span>•</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {files.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          No markdown files found in this repository
        </Card>
      )}
    </div>
  );
}

