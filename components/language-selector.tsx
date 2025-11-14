'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const LANGUAGES = [
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
];

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function LanguageSelector({ selectedLanguages, onSelectionChange }: LanguageSelectorProps) {
  const handleToggle = (code: string) => {
    if (selectedLanguages.includes(code)) {
      onSelectionChange(selectedLanguages.filter(c => c !== code));
    } else {
      onSelectionChange([...selectedLanguages, code]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLanguages.length === LANGUAGES.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(LANGUAGES.map(l => l.code));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Target Languages</h3>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-sm text-primary hover:underline"
        >
          {selectedLanguages.length === LANGUAGES.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => (
          <Card key={lang.code} className="p-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id={lang.code}
                checked={selectedLanguages.includes(lang.code)}
                onCheckedChange={() => handleToggle(lang.code)}
              />
              <Label htmlFor={lang.code} className="flex-1 cursor-pointer">
                <div className="font-medium">{lang.name}</div>
                <div className="text-sm text-muted-foreground">{lang.native}</div>
              </Label>
            </div>
          </Card>
        ))}
      </div>

      {selectedLanguages.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Please select at least one language
        </p>
      )}
    </div>
  );
}

