'use client';

import React from 'react';
import {
  X,
  Download,
  ExternalLink,
  Quote,
  Calendar,
  Users,
  GraduationCap,
  FileText,
  Tag,
  BookOpen,
  Building,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { NormalizedPublication } from '@/types/dspace';

interface ItemDetailModalProps {
  publication: NormalizedPublication | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCitation: (item: NormalizedPublication) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  publication,
  isOpen,
  onClose,
  onOpenCitation,
}) => {
  if (!isOpen || !publication) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {publication.career}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/10 text-white">
                {publication.docType}
              </span>
              {publication.year && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/10 text-white">
                  {publication.year}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold leading-snug">
              {publication.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Autores (dc.contributor.author)
              </span>
              <p className="font-semibold text-slate-900">
                {publication.authors.join('; ')}
              </p>
            </div>

            {publication.advisor && publication.advisor.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  Tutor / Asesor (dc.contributor.advisor)
                </span>
                <p className="font-semibold text-slate-900">
                  {publication.advisor.join('; ')}
                </p>
              </div>
            )}

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Fecha de Emisión (dc.date.issued)
              </span>
              <p className="font-semibold text-slate-900 font-mono">
                {publication.dateIssued || 'No especificada'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Colección en DSpace
              </span>
              <p className="font-semibold text-slate-900 truncate">
                {publication.collection || 'General'}
              </p>
            </div>
          </div>

          {/* Resumen */}
          {publication.abstract && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Resumen Académico (dc.description.abstract)
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {publication.abstract}
              </p>
            </div>
          )}

          {/* Palabras Clave y Temas */}
          {publication.subjects && publication.subjects.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Palabras Clave / Temas (dc.subject)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {publication.subjects.map((sub, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Identificadores y Enlaces DSpace */}
          <div className="pt-2 border-t border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              Identificadores Oficiales
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-mono">URI Handle:</span>
                <a
                  href={publication.handleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>{publication.handleUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-mono">DSpace UUID:</span>
                <span className="font-mono text-slate-700 text-[11px]">
                  {publication.uuid}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCitation(publication);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            <Quote className="w-3.5 h-3.5 text-blue-600" />
            <span>Generar Cita (APA/IEEE)</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={publication.handleUrl || (publication.handle ? `https://publicaciones.fctunca.edu.py/handle/${publication.handle}` : 'https://publicaciones.fctunca.edu.py')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              title="Abrir en el repositorio original DSpace"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver en DSpace</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
