'use client';

import React, { useRef, useEffect } from 'react';
import { Search, X, Sparkles, Filter, CornerDownLeft } from 'lucide-react';

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (q: string) => void;
  isLoading?: boolean;
}

const QUICK_TAGS = [
  'Inteligencia Artificial',
  'Energía Solar',
  'Hormigón',
  'Transformadores',
  'ODS 9',
  'Microcontrolador',
  'Automatización',
  'Geotecnia',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  onSearch,
  isLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Atajo de teclado: presionar '/' enfoca el buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSearch(tag);
  };

  return (
    <div className="w-full space-y-3">
      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Search className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, autor, resumen, palabras clave (ej: 'redes neuronales', 'Ramírez', 'concreto')..."
            className="w-full pl-12 pr-28 py-3.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-200/90 rounded-2xl shadow-xs text-sm md:text-base focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Borrar texto"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95"
            >
              <span>Buscar</span>
              <CornerDownLeft className="w-3 h-3 hidden sm:inline" />
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Quick Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Sugerencias:
        </span>
        <div className="flex items-center gap-1.5">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`shrink-0 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                query.toLowerCase() === tag.toLowerCase()
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
