'use client';

import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileCode, FileText, Check } from 'lucide-react';
import { GlobalFilters } from '@/types/oai';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: GlobalFilters;
  filteredCount: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  filters,
  filteredCount,
}) => {
  const [format, setFormat] = useState<'excel' | 'csv' | 'json'>('excel');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, format }),
      });

      if (!res.ok) throw new Error('Error al generar la exportación');

      const blob = await res.blob();
      const dateStr = new Date().toISOString().slice(0, 10);
      const ext = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'json';

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fcyt_publicaciones_${dateStr}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      alert((err as Error).message);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-300" />
            <h3 className="font-bold text-base">Exportar Datos Filtrados</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700">
          <p className="text-slate-600">
            Se exportarán exactamente <strong className="text-slate-900 font-bold">{filteredCount} registros</strong>{' '}
            correspondientes a la selección de filtros activos en el dashboard.
          </p>

          <div className="space-y-2">
            {/* Excel (.xlsx) */}
            <button
              type="button"
              onClick={() => setFormat('excel')}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                format === 'excel'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Microsoft Excel (.xlsx)</div>
                  <div className="text-[11px] text-slate-500">Planilla nativa con columnas formateadas</div>
                </div>
              </div>
              {format === 'excel' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            {/* CSV */}
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                format === 'csv'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Valores Separados por Comas (.csv)</div>
                  <div className="text-[11px] text-slate-500">Codificación UTF-8 con BOM universal</div>
                </div>
              </div>
              {format === 'csv' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            {/* JSON */}
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                format === 'json'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Estructura JSON (.json)</div>
                  <div className="text-[11px] text-slate-500">Para análisis estadístico en R o Python</div>
                </div>
              </div>
              {format === 'json' && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generando archivo...' : 'Descargar Archivo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
