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
      .catch(() => {});
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

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-800">
              Facultad de Ciencias y Tecnologías (FCyT) • Universidad Nacional de Caaguazú (UNCA)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Capa de Análisis y Visualización sobre el Repositorio DSpace mediante OAI-PMH • Coronel Oviedo, Paraguay
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button onClick={() => setIsSyncModalOpen(true)} className="hover:text-blue-700 hover:underline">
              Sincronizador OAI-PMH
            </button>
            <span>•</span>
            <button onClick={() => setIsExportModalOpen(true)} className="hover:text-blue-700 hover:underline">
              Exportar (.xlsx / .csv)
            </button>
            <span>•</span>
            <a
              href="https://publicaciones.fctunca.edu.py/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 hover:underline"
            >
              DSpace Oficial
            </a>
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
