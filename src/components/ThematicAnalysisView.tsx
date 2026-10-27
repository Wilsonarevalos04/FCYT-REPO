'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Globe,
  Tag,
  Search,
  ArrowUpRight,
  Filter,
  Layers,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ThematicRankingItem, OdsRankingItem, GlobalFilters } from '@/types/oai';

interface ThematicAnalysisViewProps {
  keywords: ThematicRankingItem[];
  researchLines: ThematicRankingItem[];
  odsList: OdsRankingItem[];
  onFilterChange: (filters: Partial<GlobalFilters>) => void;
}

export const ThematicAnalysisView: React.FC<ThematicAnalysisViewProps> = ({
  keywords,
  researchLines,
  odsList,
  onFilterChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'lines' | 'ods' | 'keywords'>('lines');
  const [searchKw, setSearchKw] = useState('');

  const filteredKeywords = useMemo(() => {
    if (!searchKw.trim()) return keywords;
    return keywords.filter((k) => k.name.toLowerCase().includes(searchKw.toLowerCase()));
  }, [keywords, searchKw]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub-navegación temática */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('lines')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all ${
            activeSubTab === 'lines'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Líneas de Investigación ({researchLines.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ods')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all ${
            activeSubTab === 'ods'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Objetivos ODS ({odsList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('keywords')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all ${
            activeSubTab === 'keywords'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Palabras Clave ({keywords.length})</span>
        </button>
      </div>

      {/* 1. SECCIÓN: LÍNEAS DE INVESTIGACIÓN */}
      {activeSubTab === 'lines' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Ranking de Líneas de Investigación Institucionales
              </h3>
              <p className="text-xs text-slate-500">
                Líneas temáticas prioritarias y su concentración en carreras de la FCyT
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={researchLines.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length) {
                      onFilterChange({ researchLine: e.activePayload[0].payload.name });
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    width={200}
                    tickFormatter={(val) => (val.length > 28 ? val.slice(0, 28) + '...' : val)}
                  />
                  <Tooltip formatter={(value: any) => [`${value} documentos`, 'Producción']} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} className="cursor-pointer" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla detallada de Líneas */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Relación entre Líneas de Investigación, Carreras y Tipos de Documento
              </span>
              <span className="text-xs text-slate-500">{researchLines.length} líneas registradas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Línea de Investigación</th>
                    <th className="p-3 text-right">Documentos</th>
                    <th className="p-3 text-right">% Repositorio</th>
                    <th className="p-3">Carrera Predominante</th>
                    <th className="p-3">Tipos Documentales</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {researchLines.map((line, idx) => (
                    <tr key={line.name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900">{line.name}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">{line.count}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{line.percentage}%</td>
                      <td className="p-3 text-slate-700 font-medium">{line.topCareer}</td>
                      <td className="p-3 text-slate-500">
                        {line.relatedDocTypes?.slice(0, 2).join(', ') || 'PFG'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onFilterChange({ researchLine: line.name })}
                          className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg font-semibold text-[11px]"
                        >
                          Filtrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECCIÓN: OBJETIVOS ODS */}
      {activeSubTab === 'ods' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              Alineación con los Objetivos de Desarrollo Sostenible (ODS - Agenda 2030)
            </h3>
            <p className="text-xs text-slate-500">
              Distribución de tesis de grado e investigaciones según su contribución a los ODS
            </p>
          </div>

          {/* Cuadrícula de ODS con insignias oficiales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {odsList.map((ods) => (
              <div
                key={ods.title}
                onClick={() => onFilterChange({ ods: ods.title })}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: ods.color }}
                    >
                      {ods.odsNumber}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {ods.percentage}% del total
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {ods.title}
                  </h4>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                  <span className="text-slate-500">
                    Carrera: <strong className="text-slate-700">{ods.topCareer}</strong>
                  </span>
                  <span className="font-mono font-extrabold text-slate-900 text-sm">
                    {ods.count} trab.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SECCIÓN: PALABRAS CLAVE */}
      {activeSubTab === 'keywords' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchKw}
                onChange={(e) => setSearchKw(e.target.value)}
                placeholder="Buscar palabra clave o materia..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredKeywords.length} palabras clave indexadas
            </span>
          </div>

          {/* Nube y Lista de Palabras Clave */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Nube de Descriptores y Términos Frecuentes
            </h4>
            <div className="flex flex-wrap gap-2">
              {filteredKeywords.slice(0, 60).map((kw) => (
                <button
                  key={kw.name}
                  onClick={() => onFilterChange({ query: kw.name })}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Tag className="w-3 h-3 opacity-50" />
                  <span>{kw.name}</span>
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-white px-1.5 py-0.2 rounded-md border border-slate-200">
                    {kw.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
