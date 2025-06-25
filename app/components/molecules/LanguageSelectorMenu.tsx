import React, { useState } from 'react';
import { Button, Card } from '../ui';

export interface LanguageOption {
  label: string;
  code: string;
  flag: string;
}

export interface LanguageSelectorMenuProps {
  options?: LanguageOption[];
  onSelect: (lang: LanguageOption) => void;
}

const defaultOptions: LanguageOption[] = [
  { label: 'English', code: 'EN', flag: '🇺🇸' },
  { label: 'Español', code: 'ES', flag: '🇪🇸' },
  { label: '中文', code: 'ZH', flag: '🇨🇳' },
  { label: '日本語', code: 'JA', flag: '🇯🇵' },
];

export default function LanguageSelectorMenu({
  options = defaultOptions,
  onSelect,
}: LanguageSelectorMenuProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LanguageOption>(options[0]);

  const handleSelect = (lang: LanguageOption) => {
    setSelected(lang);
    onSelect(lang);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="outline"
        onClick={() => setOpen(o => !o)}
        className="w-36 justify-between"
      >
        <span className="flex items-center gap-2">
          <span>{selected.flag}</span>
          <span className="font-medium">{selected.code}</span>
        </span>
        <span className="ml-2">▾</span>
      </Button>

      {open && (
        <Card className="absolute mt-2 w-36 p-0 z-50" variant="outlined" padding="none">
          {options.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang)}
              className="w-full flex items-center gap-2 px-4 py-2 text-token-text text-left hover:bg-token-surface-alt focus:bg-token-surface-alt focus:outline-none transition-colors"
              tabIndex={0}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
} 