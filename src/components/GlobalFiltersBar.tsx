'use client';

import React from 'react';
import {
  Filter,
  RotateCcw,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  Layers,
  GraduationCap,
  FileText,
  Tag,
  Globe,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { GlobalFilters } from '@/types/oai';

interface GlobalFiltersBarProps {
  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  availableCareers: string[];
  availableCollections: string[];
  availableDocTypes: string[];
  availableResearchLines: string[];
  availableOds: string[];
  minYear: number;
  maxYear: number;
  onReset: () => void;
  filteredCount: number;
  totalDbCount: number;
}

export const GlobalFiltersBar: React.FC<GlobalFiltersBarProps> = ({
  filters,
  setFilters,
  availableCareers,
  availableCollections,
  availableDocTypes,
  availableResearchLines,
  availableOds,
  minYear,
  maxYear,
  onReset,
  filteredCount,
  totalDbCount,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const activeCount = [
    Boolean(filters.career && filters.career !== 'all'),
    Boolean(filters.collection && filters.collection !== 'all'),
    Boolean(filters.docType && filters.docType !== 'all'),
    Boolean(filters.researchLine && filters.researchLine !== 'all'),
    Boolean(filters.ods && filters.ods !== 'all'),
    Boolean(filters.author && filters.author !== 'all'),
    Boolean(filters.year || filters.startYear || filters.endYear),
    Boolean(filters.language && filters.language !== 'all'),
    Boolean(filters.query),
    Boolean(filters.qualityOnlyIncomplete),
  ].filter(Boolean).length;

  const removeFilter = (key: keyof GlobalFilters) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      if (key === 'year' || key === 'startYear' || key === 'endYear') {
        next.year = null;
        next.startYear = null;
        next.endYear = null;
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4.5 shadow-sm space-y-3.5 transition-all">
      {/* Barra superior de búsqueda y controles rápidos */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Input de Búsqueda Rápida */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.query || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            placeholder="Buscar por título, autor, resumen, palabra clave o identificador OAI..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
          />
          {filters.query && (
            <button
              onClick={() => removeFilter('query')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Resumen de Registros & Reset & Toggle */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-200/70 font-medium">
            <span className="font-bold text-blue-700 font-mono text-sm">
              {filteredCount}
            </span>
            <span className="text-slate-600 text-[11px]">de {totalDbCount} documentos</span>
          </div>

          {/* Toggle Expandir/Colapsar Selectores */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors"
            title={isExpanded ? 'Ocultar selectores de filtros' : 'Mostrar todos los selectores de filtros'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Filtros</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              title="Restablecer todos los filtros globales"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar ({activeCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Selectores de Filtros Facetados */}
      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 text-xs animate-fadeIn">
        {/* 1. Carrera / Departamento */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-purple-600" />
            Carrera
          </label>
          <select
            value={filters.career || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, career: e.target.value }))}
            className="w-full bg-slate-50 text-slate-800 py-1.5 px-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500 font-medium text-xs"
          >
            <option value="all">Todas las Carreras</option>
            {availableCareers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Tipo de Documento */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3 text-blue-600" />
            Tipo de Documento
          </label>
          <select
            value={filters.docType || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, docType: e.target.value }))}
            className="w-full bg-slate-50 text-slate-800 py-1.5 px-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500 font-medium text-xs"
          >
            <option value="all">Todos los Tipos</option>
            {availableDocTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Colección */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-600" />
            Colección
          </label>
          <select
            value={filters.collection || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, collection: e.target.value }))}
            className="w-full bg-slate-50 text-slate-800 py-1.5 px-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500 font-medium text-xs"
          >
            <option value="all">Todas las Colecciones</option>
            {availableCollections.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Línea de Investigación */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Línea de Investigación
          </label>
          <select
            value={filters.researchLine || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, researchLine: e.target.value }))}
            className="w-full bg-slate-50 text-slate-800 py-1.5 px-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500 font-medium text-xs"
          >
            <option value="all">Todas las Líneas</option>
            {availableResearchLines.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </div>

        {/* 5. ODS */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-600" />
            Objetivo ODS
          </label>
          <select
            value={filters.ods || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, ods: e.target.value }))}
            className="w-full bg-slate-50 text-slate-800 py-1.5 px-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500 font-medium text-xs"
          >
            <option value="all">Todos los ODS</option>
            {availableOds.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Año de Publicación */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-rose-600" />
            Año ({minYear}-{maxYear})
          </label>
          <select
            value={filters.year || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                year: e.target.value ? parseInt(e.target.value, 10) : null,
                startYear: null,
                endYear: null,
              }))
            }
            className="w-full bg-slate-50 text-slate-800 py-1.5 px-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500 font-medium text-xs"
          >
            <option value="">Histórico Completo</option>
            {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((y) => (
              <option key={y} value={y}>
                Año {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      )}

      {/* Barra de Filtros Activos (Chips removibles) */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">
            Filtros Globales:
          </span>

          {filters.career && filters.career !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
              Carrera: {filters.career}
              <button onClick={() => removeFilter('career')} className="hover:text-purple-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.docType && filters.docType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold">
              Tipo: {filters.docType}
              <button onClick={() => removeFilter('docType')} className="hover:text-blue-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.collection && filters.collection !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-semibold">
              Colección: {filters.collection}
              <button onClick={() => removeFilter('collection')} className="hover:text-indigo-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.researchLine && filters.researchLine !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
              Línea: {filters.researchLine}
              <button onClick={() => removeFilter('researchLine')} className="hover:text-amber-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.ods && filters.ods !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              ODS: {filters.ods}
              <button onClick={() => removeFilter('ods')} className="hover:text-emerald-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.year && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold">
              Año: {filters.year}
              <button onClick={() => removeFilter('year')} className="hover:text-rose-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.author && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-semibold">
              Autor: {filters.author}
              <button onClick={() => removeFilter('author')} className="hover:text-slate-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.qualityOnlyIncomplete && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold">
              Solo Incompletos (&lt;100%)
              <button onClick={() => removeFilter('qualityOnlyIncomplete')} className="hover:text-amber-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
