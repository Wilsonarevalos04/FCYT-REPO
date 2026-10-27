'use client';

import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Users,
  GraduationCap,
  Sparkles,
  Globe,
  ExternalLink,
  Download,
  Info,
  Quote,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { RepositoryRecord } from '@/types/oai';

interface DocumentsCatalogViewProps {
  records: RepositoryRecord[];
  onOpenDocument: (record: RepositoryRecord) => void;
  onOpenCitation: (record: RepositoryRecord) => void;
}

export const DocumentsCatalogView: React.FC<DocumentsCatalogViewProps> = ({
  records,
  onOpenDocument,
  onOpenCitation,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'title_asc' | 'author_asc'>('date_desc');

  const sortedRecords = [...records].sort((a, b) => {
    if (sortBy === 'date_desc') return (b.year || 0) - (a.year || 0) || b.dateIssued.localeCompare(a.dateIssued);
    if (sortBy === 'date_asc') return (a.year || 0) - (b.year || 0) || a.dateIssued.localeCompare(b.dateIssued);
    if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
    if (sortBy === 'author_asc') {
      const a1 = a.authors[0] || '';
      const b1 = b.authors[0] || '';
      return a1.localeCompare(b1);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = sortedRecords.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Controles de ordenamiento y cantidad */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-slate-900 text-sm">{sortedRecords.length} Documentos en el Catálogo</span>
          <p className="text-[11px] text-slate-500">Página {currentPage} de {totalPages} • Registros sincronizados vía OAI-PMH</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e: any) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 font-medium py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
            >
              <option value="date_desc">Año más reciente ↓</option>
              <option value="date_asc">Año más antiguo ↑</option>
              <option value="title_asc">Título (A-Z)</option>
              <option value="author_asc">Primer autor (A-Z)</option>
            </select>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="bg-slate-50 font-medium py-1.5 px-2 rounded-xl border border-slate-200 text-xs text-slate-800"
          >
            <option value={10}>10 por pág.</option>
            <option value={20}>20 por pág.</option>
            <option value={50}>50 por pág.</option>
          </select>
        </div>
      </div>

      {/* Tabla de Documentos Filtrados (Punto 15) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Título del Documento</th>
                <th className="p-3">Autor(es)</th>
                <th className="p-3 text-center">Año</th>
                <th className="p-3">Carrera / Unidad</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Línea de Inv. / ODS</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.map((doc, idx) => (
                <tr key={doc.identifier} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-center font-mono text-slate-400">
                    {startIndex + idx + 1}
                  </td>
                  <td className="p-3 font-semibold text-slate-900 max-w-sm">
                    <span
                      onClick={() => onOpenDocument(doc)}
                      className="cursor-pointer hover:text-blue-700 hover:underline leading-snug line-clamp-2"
                      title={doc.title}
                    >
                      {doc.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                      {doc.identifier}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-medium max-w-[180px] truncate" title={doc.authors.join(', ')}>
                    {doc.authors.join(', ')}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-slate-800">
                    {doc.year || '-'}
                  </td>
                  <td className="p-3 text-slate-700 font-medium truncate max-w-[150px]">
                    {doc.career.replace('Ingeniería ', 'Ing. ')}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                      {doc.docType}
                    </span>
                  </td>
                  <td className="p-3 max-w-[180px]">
                    <div className="truncate text-slate-600 text-[11px]" title={doc.researchLine || 'General'}>
                      {doc.researchLine || 'General'}
                    </div>
                    {doc.ods.length > 0 && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9px] font-bold">
                        {doc.ods[0].split('-')[0].trim()}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onOpenDocument(doc)}
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver Ficha Completa"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenCitation(doc)}
                        className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Generar Cita (APA/IEEE)"
                      >
                        <Quote className="w-4 h-4" />
                      </button>
                      {doc.uri && (
                        <a
                          href={doc.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Abrir en DSpace"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Mostrando {currentItems.length} de {sortedRecords.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
