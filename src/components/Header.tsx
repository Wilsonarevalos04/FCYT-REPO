'use client';

import React from 'react';
import {
  GraduationCap,
  BarChart3,
  Users,
  Sparkles,
  Layers,
  ShieldCheck,
  BookOpen,
  RefreshCw,
  Download,
  ExternalLink,
} from 'lucide-react';

export type ActiveTabType =
  | 'overview'
  | 'authors'
  | 'thematic'
  | 'careers'
  | 'quality'
  | 'catalog';

interface HeaderProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenSync: () => void;
  onOpenExport: () => void;
  totalRecordsCount: number;
  lastSyncAt: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSync,
  onOpenExport,
  totalRecordsCount,
  lastSyncAt,
}) => {
  const headerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const h = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${h}px`);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      ro = new ResizeObserver(updateHeight);
      ro.observe(headerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      ro?.disconnect();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all"
    >
      {/* Barra Superior Institucional */}
      <div className="bg-gradient-to-r from-[#0a1d37] via-[#0f2d57] to-[#1b60b8] text-white text-xs py-1.5 px-4 sm:px-8 border-b border-blue-950/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wide text-blue-200">FCyT - UNCA</span>
            <span className="text-blue-300/40">|</span>
            <span className="text-blue-100 hidden sm:inline text-[11px] font-medium">
              Facultad de Ciencias y Tecnologías • Universidad Nacional de Caaguazú
            </span>
            <span className="text-blue-100 sm:hidden text-[11px]">FCyT - UNCA</span>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={onOpenSync}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
              title="Abrir panel de sincronización OAI-PMH"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>OAI-PMH Activo</span>
              {lastSyncAt && (
                <span className="text-[10px] text-emerald-200/70 hidden lg:inline">
                  • {new Date(lastSyncAt).toLocaleDateString('es-PY')}
                </span>
              )}
            </button>

            <a
              href="https://publicaciones.fctunca.edu.py/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-white flex items-center gap-1 text-[11px] transition-colors font-medium"
              title="Abrir repositorio oficial DSpace"
            >
              <span>Repositorio DSpace</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Barra Principal de Marca y Pestañas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col xl:flex-row items-center justify-between gap-3">
        {/* Identidad Institucional con Logo Oficial */}
        <div className="flex items-center justify-between w-full xl:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-0.5 shadow-md shadow-blue-900/15 ring-2 ring-[#1b60b8]/30 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo-fcyt.png"
                alt="Logo Oficial FCyT UNCA"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg text-slate-900 tracking-tight leading-tight">
                  Dashboard Analítico FCyT
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1b60b8]/10 text-[#1b60b8] border border-[#1b60b8]/30">
                  OAI-PMH
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Facultad de Ciencias y Tecnologías • UNCA ({totalRecordsCount} documentos)
              </p>
            </div>
          </div>

          {/* Acciones Móviles */}
          <div className="flex xl:hidden items-center gap-1.5">
            <button
              onClick={onOpenSync}
              className="p-2 text-slate-600 hover:text-blue-700 rounded-xl hover:bg-slate-100"
              title="Sincronizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenExport}
              className="p-2 text-slate-600 hover:text-blue-700 rounded-xl hover:bg-slate-100"
              title="Exportar"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación Analítica */}
        <div className="flex items-center gap-1.5 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
          <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs font-semibold shrink-0">
            {/* 1. Dashboard Principal */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${activeTab === 'overview'
                ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>General</span>
            </button>

            {/* 2. Estadísticas de Autores */}
            <button
              onClick={() => setActiveTab('authors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${activeTab === 'authors'
                ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>Autores</span>
            </button>

            {/* 3. Análisis Temático & ODS */}
            <button
              onClick={() => setActiveTab('thematic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${activeTab === 'thematic'
                ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Líneas & ODS</span>
            </button>

            {/* 4. Carreras y Unidades */}
            <button
              onClick={() => setActiveTab('careers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${activeTab === 'careers'
                ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Carreras</span>
            </button>

            {/* 5. Calidad de Metadatos */}
            <button
              onClick={() => setActiveTab('quality')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${activeTab === 'quality'
                ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Calidad</span>
            </button>

            {/* 6. Catálogo de Documentos */}
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${activeTab === 'catalog'
                ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              <span>Catálogo</span>
            </button>
          </div>

          {/* Acciones de Escritorio */}
          <div className="hidden xl:flex items-center gap-2 ml-2">
            <button
              onClick={onOpenSync}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors hover:text-blue-700"
              title="Sincronizar metadatos mediante OAI-PMH"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Sincronizar</span>
            </button>

            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#1b60b8] hover:bg-[#154c93] rounded-xl shadow-md shadow-[#1b60b8]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Exportar datos a Excel o CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
