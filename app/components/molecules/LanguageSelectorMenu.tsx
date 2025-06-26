'use client';

import React from 'react';
import { Dropdown, DropdownOption } from '../ui';

export interface LanguageOption {
  label: string;
  code: string;
  flag: string;
}

export interface LanguageSelectorMenuProps {
  options?: LanguageOption[];
  value?: string;
  onSelect: (lang: LanguageOption) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  width?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const defaultOptions: LanguageOption[] = [
  { label: 'English', code: 'EN', flag: '🇺🇸' },
  { label: 'Español', code: 'ES', flag: '🇪🇸' },
  { label: '中文', code: 'ZH', flag: '🇨🇳' },
  { label: '日本語', code: 'JA', flag: '🇯🇵' },
];

export default function LanguageSelectorMenu({
  options = defaultOptions,
  value,
  onSelect,
  size = 'md',
  variant = 'outlined',
  width = 'md',
  className = ''
}: LanguageSelectorMenuProps) {
  const dropdownOptions: DropdownOption[] = options.map(lang => ({
    value: lang.code,
    label: lang.label,
    icon: <span>{lang.flag}</span>
  }));

  const handleSelect = (option: DropdownOption) => {
    const selectedLang = options.find(lang => lang.code === option.value);
    if (selectedLang) {
      onSelect(selectedLang);
    }
  };

  return (
    <Dropdown
      options={dropdownOptions}
      value={value}
      onSelect={handleSelect}
      placeholder="Select language"
      size={size}
      variant={variant}
      width={width}
      className={`w-36 ${className}`}
    />
  );
} 