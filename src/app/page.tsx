'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Header, ActiveTabType } from '@/components/Header';
import { GlobalFiltersBar } from '@/components/GlobalFiltersBar';
import { MainDashboard } from '@/components/MainDashboard';
import { AuthorsStatsView } from '@/components/AuthorsStatsView';
import { ThematicAnalysisView } from '@/components/ThematicAnalysisView';
import { CareersComparisonView } from '@/components/CareersComparisonView';
import { MetadataQualityView } from '@/components/MetadataQualityView';
import { DocumentsCatalogView } from '@/components/DocumentsCatalogView';
import { DocumentDetailModal } from '@/components/DocumentDetailModal';
import { CitationModal } from '@/components/CitationModal';
import { SyncModal } from '@/components/SyncModal';
import { ExportModal } from '@/components/ExportModal';
import {
  Sparkles,
  ExternalLink,
  RefreshCw,
  Download,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

import {
  GlobalFilters,
  RepositoryRecord,
  CompleteAnalyticsReport,
  SyncLog,
} from '@/types/oai';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('overview');

  // Filtros globales activos
  const [filters, setFilters] = useState<GlobalFilters>({
    career: 'all',
    collection: 'all',
    docType: 'all',
    researchLine: 'all',
    ods: 'all',
  });

  // Reporte analítico completo y registros filtrados
  const [report, setReport] = useState<CompleteAnalyticsReport | null>(null);
  const [filteredRecords, setFilteredRecords] = useState<RepositoryRecord[]>([]);
  const [allDbRecords, setAllDbRecords] = useState<RepositoryRecord[]>([]);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<SyncLog[]>([]);

  // Modales
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<RepositoryRecord | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [citationDocument, setCitationDocument] = useState<RepositoryRecord | null>(null);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Función para consultar analítica y registros
  const fetchAnalyticsAndRecords = useCallback(async (currentFilters: GlobalFilters) => {
    try {
      const queryParams = new URLSearchParams();
      if (currentFilters.query) queryParams.set('query', currentFilters.query);
      if (currentFilters.career && currentFilters.career !== 'all') queryParams.set('career', currentFilters.career);
      if (currentFilters.collection && currentFilters.collection !== 'all') queryParams.set('collection', currentFilters.collection);
      if (currentFilters.docType && currentFilters.docType !== 'all') queryParams.set('docType', currentFilters.docType);
      if (currentFilters.researchLine && currentFilters.researchLine !== 'all') queryParams.set('researchLine', currentFilters.researchLine);
      if (currentFilters.ods && currentFilters.ods !== 'all') queryParams.set('ods', currentFilters.ods);
      if (currentFilters.author && currentFilters.author !== 'all') queryParams.set('author', currentFilters.author);
      if (currentFilters.year) queryParams.set('year', currentFilters.year.toString());
      if (currentFilters.startYear) queryParams.set('startYear', currentFilters.startYear.toString());
      if (currentFilters.endYear) queryParams.set('endYear', currentFilters.endYear.toString());
      if (currentFilters.language && currentFilters.language !== 'all') queryParams.set('language', currentFilters.language);
      if (currentFilters.qualityOnlyIncomplete) queryParams.set('qualityOnlyIncomplete', 'true');

      // 1. Obtener Reporte de Analítica
      const analyticsRes = await fetch(`/api/analytics?${queryParams.toString()}`);
      if (analyticsRes.ok) {
        const reportData: CompleteAnalyticsReport = await analyticsRes.json();
        setReport(reportData);
      }

      // 2. Obtener Lista de Documentos Filtrados
      queryParams.set('size', '500'); // Traer hasta 500 para la vista de catálogo
      const recordsRes = await fetch(`/api/records?${queryParams.toString()}`);
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setFilteredRecords(recordsData.items || []);
      }
    } catch (err) {
      console.error('Error al consultar datos analíticos:', err);
    }
  }, []);

  // Cargar estado inicial y logs
  const loadSyncStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/oai/sync');
      if (res.ok) {
        const data = await res.json();
        setLastSyncAt(data.lastSyncAt);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (e) {
      console.error('Error al cargar estado de sync:', e);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    loadSyncStatus();
    // Cargar todos los registros para referencia
    fetch('/api/records?size=500')
      .then((r) => r.json())
      .then((d) => setAllDbRecords(d.items || []))
      .catch(() => { });
  }, [loadSyncStatus]);

  // Actualizar cuando cambian los filtros
  useEffect(() => {
    startTransition(() => {
      fetchAnalyticsAndRecords(filters);
    });
  }, [filters, fetchAnalyticsAndRecords]);

  // Handlers
  const handleFilterUpdate = (newFilters: Partial<GlobalFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      career: 'all',
      collection: 'all',
      docType: 'all',
      researchLine: 'all',
      ods: 'all',
      year: null,
      startYear: null,
      endYear: null,
      query: '',
      author: undefined,
      qualityOnlyIncomplete: false,
    });
  };

  const handleOpenDocModal = (doc: RepositoryRecord) => {
    setSelectedDocument(doc);
    setIsDocModalOpen(true);
  };

  const handleOpenCitationModal = (doc: RepositoryRecord) => {
    setCitationDocument(doc);
    setIsCitationModalOpen(true);
  };

  // Opciones disponibles para los selectores de filtros
  const availableCareers = report ? report.careersComparison.map((c) => c.career) : [];
  const availableCollections = report ? report.collectionDistribution.map((c) => c.name) : [];
  const availableDocTypes = report ? report.docTypeDistribution.map((d) => d.name) : [];
  const availableResearchLines = report ? report.thematicAnalysis.researchLines.map((l) => l.name) : [];
  const availableOds = report ? report.thematicAnalysis.ods.map((o) => o.title) : [];
  const minYear = report?.temporalEvolution?.minYear || 2015;
  const maxYear = report?.temporalEvolution?.maxYear || 2026;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900">
      {/* Header Institucional con Pestañas y Estado OAI-PMH */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        totalRecordsCount={report?.totalAvailableInDb || allDbRecords.length || 247}
        lastSyncAt={lastSyncAt}
      />

      {/* Barra de Filtros Globales Sticky (Permanece fija/estática al hacer scroll) */}
      <div
        className="sticky z-30 w-full bg-slate-50/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all"
        style={{ top: 'var(--header-height, 92px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3">
          <GlobalFiltersBar
            filters={filters}
            setFilters={setFilters}
            availableCareers={availableCareers}
            availableCollections={availableCollections}
            availableDocTypes={availableDocTypes}
            availableResearchLines={availableResearchLines}
            availableOds={availableOds}
            minYear={minYear}
            maxYear={maxYear}
            onReset={handleResetFilters}
            filteredCount={report?.filteredCount || filteredRecords.length}
            totalDbCount={report?.totalAvailableInDb || allDbRecords.length || 247}
          />
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* 1. VISTA: DASHBOARD GENERAL */}
        {activeTab === 'overview' && report && (
          <MainDashboard report={report} onFilterChange={handleFilterUpdate} />
        )}

        {/* 2. VISTA: ESTADÍSTICAS DE AUTORES */}
        {activeTab === 'authors' && report && (
          <AuthorsStatsView
            authors={report.authorRanking}
            allRecords={filteredRecords}
            onFilterChange={handleFilterUpdate}
            onOpenDocument={handleOpenDocModal}
          />
        )}

        {/* 3. VISTA: ANÁLISIS TEMÁTICO & ODS */}
        {activeTab === 'thematic' && report && (
          <ThematicAnalysisView
            keywords={report.thematicAnalysis.keywords}
            researchLines={report.thematicAnalysis.researchLines}
            odsList={report.thematicAnalysis.ods}
            onFilterChange={handleFilterUpdate}
          />
        )}

        {/* 4. VISTA: CARRERAS Y UNIDADES */}
        {activeTab === 'careers' && report && (
          <CareersComparisonView
            careers={report.careersComparison}
            careerYearlyStats={report.temporalEvolution.byCareerYear}
            onFilterChange={handleFilterUpdate}
          />
        )}

        {/* 5. VISTA: CALIDAD DE METADATOS */}
        {activeTab === 'quality' && report && (
          <MetadataQualityView
            audit={report.metadataAudit}
            records={filteredRecords}
            onFilterChange={handleFilterUpdate}
            onOpenDocument={handleOpenDocModal}
          />
        )}

        {/* 6. VISTA: CATÁLOGO Y FICHAS DE DOCUMENTOS */}
        {activeTab === 'catalog' && (
          <DocumentsCatalogView
            records={filteredRecords}
            onOpenDocument={handleOpenDocModal}
            onOpenCitation={handleOpenCitationModal}
          />
        )}
      </main>

      {/* Footer Institucional con Logo Oficial y Creadores */}
      <footer className="mt-auto bg-gradient-to-b from-slate-900 via-slate-950 to-[#071326] text-white border-t border-slate-800/80 pt-10 pb-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Columna Izquierda: Identidad Institucional y Logo */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-xl ring-2 ring-[#1b60b8]/40 shrink-0 flex items-center justify-center">
                <img
                  src="/logo-fcyt.png"
                  alt="Escudo Oficial FCyT UNCA"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1b60b8]/30 text-blue-200 border border-[#1b60b8]/40">
                  <ShieldCheck className="w-3 h-3 text-blue-300" />
                  <span>Universidad Nacional de Caaguazú</span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Facultad de Ciencias y Tecnologías (FCyT)
                </h3>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                  Sistema de Inteligencia Institucional y Dashboard Estadístico para el Repositorio DSpace mediante el protocolo OAI-PMH.
                </p>
                <p className="text-[11px] text-blue-300/80 font-medium">
                  Sede Coronel Oviedo • Paraguay • <em>Arandu Poty Rekávo</em>
                </p>
              </div>
            </div>

            {/* Columna Derecha: Créditos de los Creadores (Compacto y Estético) */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 sm:p-4 backdrop-blur-md shadow-md">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-300 flex items-center gap-1.5">
                    Creadores y Desarrollo
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1b60b8]/30 text-blue-200 border border-[#1b60b8]/40">
                    FCyT - UNCA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="https://github.com/Wilsonarevalos04"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-slate-900/60 hover:bg-slate-900/90 p-2.5 rounded-lg border border-white/5 hover:border-blue-400/40 transition-all duration-150 flex items-center justify-between gap-2 shadow-xs"
                    title="Ver perfil de GitHub de Wilson Arévalos"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-[#1b60b8]/30 text-blue-300 flex items-center justify-center font-black text-[10px] shrink-0 border border-[#1b60b8]/40 group-hover:scale-105 transition-transform">
                        WA
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[11px] text-white tracking-tight leading-tight group-hover:text-blue-200 transition-colors">
                          Wilson Arévalos
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg className="w-2.5 h-2.5 text-slate-400 group-hover:text-white shrink-0 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                          <span className="text-[9.5px] text-blue-300 font-medium truncate">@Wilsonarevalos04</span>
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-300 shrink-0 transition-colors" />
                  </a>

                  <a
                    href="https://github.com/Areco-Github"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-slate-900/60 hover:bg-slate-900/90 p-2.5 rounded-lg border border-white/5 hover:border-emerald-400/40 transition-all duration-150 flex items-center justify-between gap-2 shadow-xs"
                    title="Ver perfil de GitHub de Jorge Areco"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-[10px] shrink-0 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                        JA
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[11px] text-white tracking-tight leading-tight group-hover:text-emerald-200 transition-colors">
                          Jorge Areco
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg className="w-2.5 h-2.5 text-slate-400 group-hover:text-white shrink-0 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                          <span className="text-[9.5px] text-emerald-300 font-medium truncate">@Areco-Github</span>
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-300 shrink-0 transition-colors" />
                  </a>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsSyncModalOpen(true)}
                      className="text-blue-300 hover:text-white transition-colors"
                    >
                      Sincronizador
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      className="text-blue-300 hover:text-white transition-colors"
                    >
                      Exportador
                    </button>
                    <span>•</span>
                    <a
                      href="https://publicaciones.fctunca.edu.py/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>DSpace Oficial</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
            </div>
          </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} Facultad de Ciencias y Tecnologías — Universidad Nacional de Caaguazú. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Next.js 16</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">TypeScript</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">OAI-PMH v2.0</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modales del Sistema */}
      <DocumentDetailModal
        document={selectedDocument}
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onOpenCitation={handleOpenCitationModal}
      />

      <CitationModal
        publication={citationDocument}
        isOpen={isCitationModalOpen}
        onClose={() => setIsCitationModalOpen(false)}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        lastSyncAt={lastSyncAt}
        totalRecordsInDb={report?.totalAvailableInDb || allDbRecords.length}
        recentLogs={recentLogs}
        onSyncCompleted={() => {
          loadSyncStatus();
          fetchAnalyticsAndRecords(filters);
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filters={filters}
        filteredCount={report?.filteredCount || filteredRecords.length}
      />
    </div>
  );
}
