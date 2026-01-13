import { memo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector = memo(function LanguageSelector({ 
  className, 
  showLabel = true 
}: LanguageSelectorProps) {
  const { language, setLanguage, languageNames, languageFlags, availableLanguages, t } = useLanguage();

  return (
    <div className={className}>
      {showLabel && (
        <label className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
          <Globe className="h-3.5 w-3.5" />
          {t.profile.language}
        </label>
      )}
      <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
        <SelectTrigger className="bg-secondary/50 border-border/50 rounded-xl">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{languageFlags[language]}</span>
              <span>{languageNames[language]}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              <span className="flex items-center gap-2">
                <span>{languageFlags[lang]}</span>
                <span>{languageNames[lang]}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
