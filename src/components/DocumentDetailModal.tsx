'use client';

import React from 'react';
import {
  X,
  ExternalLink,
  Download,
  Quote,
  Calendar,
  Users,
  GraduationCap,
  Sparkles,
  Globe,
  FileText,
  Tag,
  Building,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { RepositoryRecord } from '@/types/oai';

interface DocumentDetailModalProps {
  document: RepositoryRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCitation: (doc: RepositoryRecord) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  isOpen,
  onClose,
  onOpenCitation,
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header Institucional */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {document.career}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/10 text-white">
                {document.docType}
              </span>
              {document.year && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/10 text-white">
                  Año {document.year}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold leading-snug">{document.title}</h2>
          </div>

          <button onClick={onClose} className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con Metadatos Mínimos Requeridos (Punto 13) */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Grilla de Datos Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Autor(es)
              </span>
              <p className="font-bold text-slate-900 text-sm">{document.authors.join('; ')}</p>
            </div>

            {document.advisors.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  Tutor / Asesor
                </span>
                <p className="font-semibold text-slate-800">{document.advisors.join('; ')}</p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Fecha de Emisión
              </span>
              <p className="font-semibold text-slate-800 font-mono">{document.dateIssued || 'No especificada'}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Colección en DSpace
              </span>
              <p className="font-semibold text-slate-800">{document.collection}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Línea de Investigación
              </span>
              <p className="font-semibold text-slate-800">{document.researchLine || 'No especificada'}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Calidad de Metadatos
              </span>
              <p className="font-bold font-mono text-emerald-700">{document.quality.completenessScore}% Completo</p>
            </div>
          </div>

          {/* ODS */}
          {document.ods.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Objetivos de Desarrollo Sostenible (ODS)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {document.ods.map((o) => (
                  <span
                    key={o}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Palabras Clave */}
          {document.subjects.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Palabras Clave / Materias
              </span>
              <div className="flex flex-wrap gap-1.5">
                {document.subjects.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resumen */}
          {document.abstract && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Resumen Académico
              </span>
              <p className="text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100 whitespace-pre-line text-xs">
                {document.abstract}
              </p>
            </div>
          )}

          {/* Identificadores y Enlaces Oficiales */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Identificador OAI:</span>
              <span className="font-bold text-slate-800">{document.identifier}</span>
            </div>
            {document.uri && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Enlace DSpace (Handle):</span>
                <a
                  href={document.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>{document.uri}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={() => {
              onClose();
              onOpenCitation(document);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
          >
            <Quote className="w-3.5 h-3.5 text-blue-600" />
            <span>Generar Cita (APA/IEEE)</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={document.uri || (document.identifier ? `https://publicaciones.fctunca.edu.py/handle/${document.identifier}` : 'https://publicaciones.fctunca.edu.py')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl"
              title="Abrir en el repositorio original DSpace"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver en DSpace</span>
            </a>

            <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
