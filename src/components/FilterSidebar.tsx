'use client';

import React from 'react';
import {
  Filter,
  RotateCcw,
  GraduationCap,
  Calendar,
  FileText,
  Tag,
  ChevronDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { FilterParams } from '@/types/dspace';

interface FilterSidebarProps {
  filters: FilterParams;
  setFilters: React.Dispatch<React.SetStateAction<FilterParams>>;
  onReset: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  careerStats: { career: string; count: number }[];
  yearStats: { year: number; count: number }[];
  docTypeStats: { docType: string; count: number }[];
  topSubjects: { subject: string; count: number }[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  onReset,
  isOpenMobile,
  setIsOpenMobile,
  careerStats,
  yearStats,
  docTypeStats,
  topSubjects,
}) => {
  // Contar cuántos filtros están activos actualmente
  const activeFiltersCount = [
    Boolean(filters.career && filters.career !== 'all'),
    Boolean(filters.startYear || filters.endYear || filters.exactYear),
    Boolean(filters.docType && filters.docType !== 'all'),
    Boolean(filters.subject && filters.subject !== 'all'),
  ].filter(Boolean).length;

  const handleCareerChange = (career: string) => {
    setFilters((prev) => ({
      ...prev,
      career: career === prev.career ? 'all' : career,
      page: 1,
    }));
  };

  const handleYearPreset = (start: number | null, end: number | null) => {
    setFilters((prev) => ({
      ...prev,
      startYear: start,
      endYear: end,
      exactYear: null,
      page: 1,
    }));
  };

  const handleExactYear = (yearStr: string) => {
    const yr = yearStr ? parseInt(yearStr, 10) : null;
    setFilters((prev) => ({
      ...prev,
      exactYear: yr,
      startYear: null,
      endYear: null,
      page: 1,
    }));
  };

  const handleDocTypeChange = (docType: string) => {
    setFilters((prev) => ({
      ...prev,
      docType: docType === prev.docType ? 'all' : docType,
      page: 1,
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFilters((prev) => ({
      ...prev,
      subject: subject === prev.subject ? 'all' : subject,
      page: 1,
    }));
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-700" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Filtros Avanzados
          </h2>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-700 text-white">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition-colors"
            title="Restablecer todos los filtros"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 1. FILTRO POR CARRERA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            Carrera o Departamento
          </span>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleCareerChange('all')}
            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
              !filters.career || filters.career === 'all'
                ? 'bg-blue-50 text-blue-800 font-semibold ring-1 ring-blue-200'
                : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <span>Todas las Carreras</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {careerStats.reduce((acc, c) => acc + c.count, 0)}
            </span>
          </button>

          {careerStats.map((c) => {
            const isSelected = filters.career === c.career;
            return (
              <button
                key={c.career}
                type="button"
                onClick={() => handleCareerChange(c.career)}
                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-800 font-semibold ring-1 ring-blue-200'
                    : 'text-slate-600 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      c.career.includes('Informática')
                        ? 'bg-purple-500'
                        : c.career.includes('Civil')
                        ? 'bg-emerald-500'
                        : c.career.includes('Electricidad')
                        ? 'bg-amber-500'
                        : c.career.includes('Electrónica')
                        ? 'bg-cyan-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="truncate">{c.career}</span>
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ${
                    isSelected
                      ? 'bg-blue-200/70 text-blue-900 font-bold'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. FILTRO POR AÑO DE PUBLICACIÓN */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          Año de Publicación
        </span>

        {/* Presets rápidos */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleYearPreset(null, null)}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center border transition-all ${
              !filters.startYear && !filters.endYear && !filters.exactYear
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Histórico (Todos)
          </button>
          <button
            type="button"
            onClick={() => handleYearPreset(2024, 2026)}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center border transition-all ${
              filters.startYear === 2024 && filters.endYear === 2026
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            2024 - 2026
          </button>
          <button
            type="button"
            onClick={() => handleYearPreset(2020, 2023)}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center border transition-all ${
              filters.startYear === 2020 && filters.endYear === 2023
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            2020 - 2023
          </button>
          <button
            type="button"
            onClick={() => handleYearPreset(2015, 2019)}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center border transition-all ${
              filters.startYear === 2015 && filters.endYear === 2019
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            2015 - 2019
          </button>
        </div>

        {/* Selector de año exacto */}
        <div className="pt-1">
          <label className="text-[11px] font-medium text-slate-500 block mb-1">
            Seleccionar un año específico:
          </label>
          <select
            value={filters.exactYear || ''}
            onChange={(e) => handleExactYear(e.target.value)}
            className="w-full bg-white text-slate-700 text-xs py-2 px-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Cualquier año</option>
            {yearStats
              .slice()
              .reverse()
              .map((y) => (
                <option key={y.year} value={y.year}>
                  {y.year} ({y.count} publicaciones)
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* 3. FILTRO POR TIPO DE DOCUMENTO */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Tipo de Documento
        </span>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleDocTypeChange('all')}
            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
              !filters.docType || filters.docType === 'all'
                ? 'bg-blue-50 text-blue-800 font-semibold ring-1 ring-blue-200'
                : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <span>Todos los tipos</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {docTypeStats.reduce((acc, d) => acc + d.count, 0)}
            </span>
          </button>

          {docTypeStats.map((d) => {
            const isSelected = filters.docType === d.docType;
            return (
              <button
                key={d.docType}
                type="button"
                onClick={() => handleDocTypeChange(d.docType)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-800 font-semibold ring-1 ring-blue-200'
                    : 'text-slate-600 hover:bg-slate-100/80'
                }`}
              >
                <span className="truncate pr-2">{d.docType}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ${
                    isSelected
                      ? 'bg-blue-200/70 text-blue-900 font-bold'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {d.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. TEMAS Y ÁREAS CLAVE */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          Temas y Objetivos ODS
        </span>

        <div className="flex flex-wrap gap-1.5">
          {topSubjects.slice(0, 10).map((s) => {
            const isSelected = filters.subject === s.subject;
            return (
              <button
                key={s.subject}
                type="button"
                onClick={() => handleSubjectChange(s.subject)}
                className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                {s.subject}
                <span className="ml-1 opacity-70 text-[10px]">({s.count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Botón flotante móvil para abrir filtros */}
      <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filtros Facetados</span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.2 bg-white text-blue-800 rounded-full text-[10px] font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-rose-600 font-medium hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Modal / Drawer en Pantallas Móviles */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpenMobile(false)}
          />

          <div className="relative ml-auto w-full max-w-xs h-full bg-white p-5 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-sm">
                  Filtros del Repositorio
                </span>
                <button
                  onClick={() => setIsOpenMobile(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sidebarContent}
            </div>

            <div className="pt-4 border-t border-slate-200 mt-6 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsOpenMobile(false)}
                className="w-full py-2.5 bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar fijo en escritorio */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-28 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
};
