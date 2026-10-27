'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Quote, ExternalLink } from 'lucide-react';

interface CitationModalProps {
  publication: {
    title: string;
    authors: string[];
    year: number | null;
    docType: string;
    uri?: string;
    handleUrl?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  publication,
  isOpen,
  onClose,
}) => {
  const [style, setStyle] = useState<'apa' | 'ieee' | 'bibtex'>('apa');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !publication) return null;

  const docUrl = publication.uri || publication.handleUrl || 'https://publicaciones.fctunca.edu.py';

  // Formato APA 7ma Edición
  const formatAPA = () => {
    const authorsStr = publication.authors.join(', ');
    const yearStr = publication.year ? `(${publication.year})` : '(s.f.)';
    return `${authorsStr} ${yearStr}. ${publication.title} [${publication.docType}, Facultad de Ciencias y Tecnologías, Universidad Nacional de Caaguazú]. Repositorio Institucional FCyT UNCA. ${docUrl}`;
  };

  // Formato IEEE
  const formatIEEE = () => {
    const authorsStr = publication.authors.join(', ');
    return `${authorsStr}, "${publication.title}," ${publication.docType}, Fac. Ciencias y Tecnologías, Univ. Nac. de Caaguazú, Coronel Oviedo, Paraguay, ${publication.year || 's.f.'}. [En línea]. Disponible en: ${docUrl}`;
  };

  // Formato BibTeX
  const formatBibTeX = () => {
    const firstAuthor = (publication.authors[0] || 'autor').split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const bibKey = `${firstAuthor}${publication.year || 'sf'}_fcyt`;
    return `@thesis{${bibKey},
  title     = {${publication.title}},
  author    = {${publication.authors.join(' and ')}},
  year      = {${publication.year || 's.f.'}},
  school    = {Facultad de Ciencias y Tecnolog\\'{i}as, Universidad Nacional de Caaguaz\\'{u}},
  type      = {${publication.docType}},
  address   = {Coronel Oviedo, Paraguay},
  url       = {${docUrl}}
}`;
  };

  const getCitationText = () => {
    if (style === 'apa') return formatAPA();
    if (style === 'ieee') return formatIEEE();
    return formatBibTeX();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCitationText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden z-10">
        <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-blue-300" />
            <h3 className="font-bold text-base">Citar Publicación Académica</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 font-medium line-clamp-1">{publication.title}</p>

          {/* Selector de Estilo */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setStyle('apa')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                style === 'apa' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              APA (7ª ed.)
            </button>
            <button
              onClick={() => setStyle('ieee')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                style === 'ieee' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              IEEE
            </button>
            <button
              onClick={() => setStyle('bibtex')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                style === 'bibtex' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              BibTeX
            </button>
          </div>

          {/* Caja con la Cita */}
          <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 leading-relaxed max-h-48 overflow-y-auto">
            {getCitationText()}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
              title="Abrir publicación en el repositorio DSpace original"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver en DSpace original</span>
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                copied ? 'bg-emerald-600 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar al portapapeles</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
