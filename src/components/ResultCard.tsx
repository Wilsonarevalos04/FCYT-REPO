'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Calendar,
  Users,
  GraduationCap,
  Tag,
  Quote,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
} from 'lucide-react';
import { NormalizedPublication } from '@/types/dspace';

interface ResultCardProps {
  publication: NormalizedPublication;
  onOpenDetails: (item: NormalizedPublication) => void;
  onOpenCitation: (item: NormalizedPublication) => void;
  onFilterBySubject?: (subject: string) => void;
  onFilterByAuthor?: (author: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  publication,
  onOpenDetails,
  onOpenCitation,
  onFilterBySubject,
  onFilterByAuthor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Formato legible para tamaño de archivo
  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Asignar colores por Carrera
  const getCareerBadgeStyle = (career: string) => {
    if (career.includes('Informática')) {
      return 'bg-purple-50 text-purple-700 border-purple-200/80';
    }
    if (career.includes('Civil')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }
    if (career.includes('Electricidad')) {
      return 'bg-amber-50 text-amber-800 border-amber-200/80';
    }
    if (career.includes('Electrónica')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between">
      <div>
        {/* Badges superiores: Carrera, Año, Tipo de Documento */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${getCareerBadgeStyle(
              publication.career
            )}`}
          >
            {publication.career}
          </span>

          {publication.year && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Calendar className="w-3 h-3 text-slate-500" />
              {publication.year}
            </span>
          )}

          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
            {publication.docType}
          </span>
        </div>

        {/* Título de la Publicación */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2 mb-2.5">
          {publication.title}
        </h3>

        {/* Autores */}
        <div className="flex items-start gap-2 mb-2 text-xs text-slate-600">
          <Users className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {publication.authors.map((author, idx) => (
              <span
                key={idx}
                onClick={() => onFilterByAuthor && onFilterByAuthor(author)}
                className="hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                title={`Filtrar por ${author}`}
              >
                {author}
                {idx < publication.authors.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Tutor / Asesor si existe */}
        {publication.advisor && publication.advisor.length > 0 && (
          <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-500">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Tutor(a): {publication.advisor.join(', ')}</span>
          </div>
        )}

        {/* Resumen (Abstract) */}
        {publication.abstract && (
          <div className="my-3 text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
            <p className={isExpanded ? '' : 'line-clamp-3'}>
              {publication.abstract}
            </p>
            {publication.abstract.length > 180 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <span>Ver menos</span>
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span>Leer resumen completo</span>
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Etiquetas de Materia / ODS */}
        {publication.subjects && publication.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
            {publication.subjects.slice(0, 4).map((sub, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onFilterBySubject && onFilterBySubject(sub)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/60 transition-colors"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                <span className="truncate max-w-[200px]">{sub}</span>
              </button>
            ))}
            {publication.subjects.length > 4 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{publication.subjects.length - 4} más
              </span>
            )}
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1.5">
          {/* Botón directo a DSpace del repositorio original */}
          <a
            href={publication.handleUrl || (publication.handle ? `https://publicaciones.fctunca.edu.py/handle/${publication.handle}` : 'https://publicaciones.fctunca.edu.py')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            title="Abrir publicación en el repositorio original DSpace"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver en DSpace</span>
          </a>

          {/* Botón Citar */}
          <button
            type="button"
            onClick={() => onOpenCitation(publication)}
            className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors"
            title="Generar Cita (APA, IEEE, BibTeX)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          {/* Botón Detalles Dublin Core */}
          <button
            type="button"
            onClick={() => onOpenDetails(publication)}
            className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors"
            title="Ver todos los metadatos Dublin Core"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Identificador DSpace Handle */}
        {publication.handle && (
          <span className="text-[11px] font-mono text-slate-400">
            Handle #{publication.handle.split('/')[1] || publication.handle}
          </span>
        )}
      </div>
    </article>
  );
};
