'use client';

import React, { useState } from 'react';
import {
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  FileQuestion,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react';
import { NormalizedPublication, FilterParams } from '@/types/dspace';
import { ResultCard } from './ResultCard';

interface ResultsListProps {
  items: NormalizedPublication[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  filters: FilterParams;
  setFilters: React.Dispatch<React.SetStateAction<FilterParams>>;
  onOpenDetails: (item: NormalizedPublication) => void;
  onOpenCitation: (item: NormalizedPublication) => void;
  onResetFilters: () => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({
  items,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  isLoading,
  filters,
  setFilters,
  onOpenDetails,
  onOpenCitation,
  onResetFilters,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: e.target.value as FilterParams['sortBy'],
      page: 1,
    }));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      size: parseInt(e.target.value, 10),
      page: 1,
    }));
  };

  // Remove individual filter chip
  const removeFilter = (key: keyof FilterParams) => {
    setFilters((prev) => {
      const updated = { ...prev, page: 1 };
      if (key === 'career') updated.career = 'all';
      if (key === 'docType') updated.docType = 'all';
      if (key === 'subject') updated.subject = 'all';
      if (key === 'query') updated.query = '';
      if (key === 'exactYear' || key === 'startYear' || key === 'endYear') {
        updated.exactYear = null;
        updated.startYear = null;
        updated.endYear = null;
      }
      return updated;
    });
  };

  // Generar números de páginas para la paginación
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <section className="flex-1 min-w-0">
      {/* Barra de Controles Superior */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-slate-900">
            {isLoading ? 'Cargando publicaciones...' : `${totalElements} Resultados`}
          </span>
          <span className="text-xs text-slate-500 block">
            Página {currentPage} de {Math.max(1, totalPages)} • Repositorio FCyT
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Selector de Orden */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy || 'date_desc'}
              onChange={handleSortChange}
              className="bg-slate-50 text-slate-700 font-medium py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="date_desc">Más recientes primero</option>
              <option value="date_asc">Más antiguos primero</option>
              <option value="title_asc">Título (A-Z)</option>
              <option value="relevance">Relevancia</option>
            </select>
          </div>

          {/* Selector de cantidad por página */}
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="bg-slate-50 text-slate-700 font-medium py-1.5 px-2 rounded-xl border border-slate-200 text-xs"
            title="Elementos por página"
          >
            <option value={12}>12 por pág.</option>
            <option value={24}>24 por pág.</option>
            <option value={48}>48 por pág.</option>
          </select>

          {/* Vista Cuadrícula / Lista */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista en cuadrícula"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista en lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chips de Filtros Activos */}
      {(filters.career !== 'all' && filters.career ||
        filters.exactYear ||
        filters.startYear ||
        (filters.docType && filters.docType !== 'all') ||
        (filters.subject && filters.subject !== 'all') ||
        filters.query) && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
          <span className="font-semibold text-blue-900 mr-1 text-[11px]">
            Filtros aplicados:
          </span>

          {filters.query && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 text-[11px] font-medium shadow-2xs">
              Texto: &ldquo;{filters.query}&rdquo;
              <button
                onClick={() => removeFilter('query')}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.career && filters.career !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 text-[11px] font-medium shadow-2xs">
              Carrera: {filters.career}
              <button
                onClick={() => removeFilter('career')}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.exactYear && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 text-[11px] font-medium shadow-2xs">
              Año: {filters.exactYear}
              <button
                onClick={() => removeFilter('exactYear')}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filters.startYear || filters.endYear) && !filters.exactYear && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 text-[11px] font-medium shadow-2xs">
              Años: {filters.startYear || '2000'} - {filters.endYear || 'Presente'}
              <button
                onClick={() => removeFilter('startYear')}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.docType && filters.docType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 text-[11px] font-medium shadow-2xs">
              Tipo: {filters.docType}
              <button
                onClick={() => removeFilter('docType')}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.subject && filters.subject !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 text-[11px] font-medium shadow-2xs">
              Tema: {filters.subject}
              <button
                onClick={() => removeFilter('subject')}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline ml-auto"
          >
            Limpiar todos
          </button>
        </div>
      )}

      {/* Skeletons de Carga */}
      {isLoading && (
        <div
          className={`grid gap-4 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 animate-pulse"
            >
              <div className="flex gap-2">
                <div className="h-6 w-28 bg-slate-200 rounded-lg" />
                <div className="h-6 w-16 bg-slate-200 rounded-lg" />
              </div>
              <div className="h-5 w-5/6 bg-slate-200 rounded-md" />
              <div className="h-4 w-1/2 bg-slate-200 rounded-md" />
              <div className="h-16 w-full bg-slate-100 rounded-xl" />
              <div className="h-8 w-1/3 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Estado Vacío (Sin Resultados) */}
      {!isLoading && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6 shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No se encontraron publicaciones
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            No hay trabajos académicos que coincidan con la combinación de filtros seleccionados. Intenta ampliar los términos de búsqueda o cambiar de carrera.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Filtros</span>
          </button>
        </div>
      )}

      {/* Lista de Publicaciones */}
      {!isLoading && items.length > 0 && (
        <div
          className={`grid gap-4 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {items.map((pub) => (
            <ResultCard
              key={pub.id}
              publication={pub}
              onOpenDetails={onOpenDetails}
              onOpenCitation={onOpenCitation}
              onFilterBySubject={(sub) =>
                setFilters((prev) => ({ ...prev, subject: sub, page: 1 }))
              }
              onFilterByAuthor={(author) =>
                setFilters((prev) => ({ ...prev, author: author, page: 1 }))
              }
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500">
            Mostrando {items.length} de {totalElements} publicaciones
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((num, idx) =>
              num === '...' ? (
                <span key={idx} className="px-2 text-slate-400 text-xs">
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => handlePageChange(num as number)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                    currentPage === num
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {num}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
