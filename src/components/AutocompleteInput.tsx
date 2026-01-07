import { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: { id: string; name: string }) => void;
  suggestions: { id: string; name: string }[];
  placeholder?: string;
  className?: string;
}

// Normaliza string para comparação (remove acentos, lowercase)
function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Calcula similaridade entre duas strings (0 a 1)
function similarity(s1: string, s2: string): number {
  const n1 = normalize(s1);
  const n2 = normalize(s2);
  
  if (n1 === n2) return 1;
  if (n1.length === 0 || n2.length === 0) return 0;
  
  // Verifica se uma contém a outra
  if (n1.includes(n2) || n2.includes(n1)) {
    return 0.9;
  }
  
  // Levenshtein distance simplificado
  const longer = n1.length > n2.length ? n1 : n2;
  const shorter = n1.length > n2.length ? n2 : n1;
  
  if (longer.length === 0) return 1;
  
  // Conta caracteres em comum na mesma posição aproximada
  let matches = 0;
  const shorterChars = shorter.split('');
  const longerChars = longer.split('');
  
  shorterChars.forEach((char, i) => {
    // Verifica se existe o caractere na posição ou próximo
    for (let j = Math.max(0, i - 2); j <= Math.min(longerChars.length - 1, i + 2); j++) {
      if (longerChars[j] === char) {
        matches++;
        longerChars[j] = ''; // Marca como usado
        break;
      }
    }
  });
  
  return matches / longer.length;
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder,
  className,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filtra e ordena sugestões por similaridade
  const filteredSuggestions = useMemo(() => {
    if (!value.trim()) return suggestions.slice(0, 5);
    
    const normalizedInput = normalize(value);
    
    return suggestions
      .map(item => ({
        ...item,
        score: similarity(item.name, value),
        startsWith: normalize(item.name).startsWith(normalizedInput),
      }))
      .filter(item => item.score > 0.3 || item.startsWith)
      .sort((a, b) => {
        // Prioriza matches que começam com o input
        if (a.startsWith && !b.startsWith) return -1;
        if (!a.startsWith && b.startsWith) return 1;
        // Depois ordena por score
        return b.score - a.score;
      })
      .slice(0, 5);
  }, [value, suggestions]);

  // Fecha quando clica fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleSelect = (item: { id: string; name: string }) => {
    onChange(item.name);
    onSelect?.(item);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredSuggestions[highlightedIndex]) {
          handleSelect(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const showSuggestions = isOpen && filteredSuggestions.length > 0;

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {showSuggestions && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in"
        >
          {filteredSuggestions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                index === highlightedIndex && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
