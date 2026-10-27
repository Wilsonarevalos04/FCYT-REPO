'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Filter,
  GraduationCap,
} from 'lucide-react';
import { MetadataAuditSummary, RepositoryRecord, GlobalFilters } from '@/types/oai';

interface MetadataQualityViewProps {
  audit: MetadataAuditSummary;
  records: RepositoryRecord[];
  onFilterChange: (filters: Partial<GlobalFilters>) => void;
  onOpenDocument: (record: RepositoryRecord) => void;
}

export const MetadataQualityView: React.FC<MetadataQualityViewProps> = ({
  audit,
  records,
  onFilterChange,
  onOpenDocument,
}) => {
  // Filtrar documentos que tienen algún campo faltante
  const incompleteRecords = records.filter((r) => r.quality.completenessScore < 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Semáforo Global de Salud del Repositorio */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Auditoría y Gobernanza de Metadatos OAI-PMH
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Índice de Completitud y Calidad de Metadatos
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitoreo institucional de consistencia y campos obligatorios de Dublin Core para acreditación universitaria y catalogación científica.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center shrink-0 w-full md:w-auto">
            <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-300">
              {audit.overallHealthPercentage}%
            </div>
            <div className="text-xs uppercase font-bold text-slate-300 tracking-wider mt-1">
              Salud Promedio Global
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {audit.perfectRecords} de {audit.totalAnalyzed} registros al 100%
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas de Deficiencias y Campos Faltantes (Punto 18) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Sin Resumen */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Sin Resumen</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
            {audit.missingAbstractCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {((audit.missingAbstractCount / audit.totalAnalyzed) * 100).toFixed(1)}% del repositorio
          </p>
        </div>

        {/* Sin Línea de Investigación */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Sin Línea Inv.</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
            {audit.missingResearchLineCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Requieren etiquetado temático</p>
        </div>

        {/* Sin ODS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Sin ODS</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
            {audit.missingOdsCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">No vinculados a ODS 2030</p>
        </div>

        {/* Sin PDF Directo */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Sin Archivo PDF</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
            {audit.missingPdfCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Requieren bitstream adjunto</p>
        </div>
      </div>

      {/* 3. Tabla de Calidad por Carrera */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-700" />
            Calidad de Metadatos por Carrera
          </h3>
          <div className="space-y-3">
            {audit.byCareerQuality.map((cq) => (
              <div key={cq.career} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cq.career}</span>
                  <span className="font-mono font-bold text-slate-900">{cq.score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cq.score >= 90 ? 'bg-emerald-500' : cq.score >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${cq.score}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  {cq.incompleteCount} registros con campos faltantes
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Tabla de Registros Incompletos para Corrección */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Registros que Requieren Corrección en DSpace
              </h3>
              <p className="text-xs text-slate-500">
                Lista de {incompleteRecords.length} documentos con información incompleta
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-2.5">Título</th>
                  <th className="p-2.5">Carrera</th>
                  <th className="p-2.5">Campos Faltantes</th>
                  <th className="p-2.5 text-center">Score</th>
                  <th className="p-2.5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incompleteRecords.slice(0, 30).map((r) => (
                  <tr key={r.identifier} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 font-medium text-slate-900 max-w-[200px] truncate" title={r.title}>
                      {r.title}
                    </td>
                    <td className="p-2.5 text-slate-600">{r.career.replace('Ingeniería ', 'Ing. ')}</td>
                    <td className="p-2.5">
                      <div className="flex flex-wrap gap-1">
                        {r.quality.missingFields.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-700">
                      {r.quality.completenessScore}%
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => onOpenDocument(r)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
