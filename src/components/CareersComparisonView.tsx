'use client';

import React from 'react';
import {
  GraduationCap,
  Users,
  Sparkles,
  Globe,
  FileText,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CareerComparativeItem, CareerYearlyStat, GlobalFilters } from '@/types/oai';

interface CareersComparisonViewProps {
  careers: CareerComparativeItem[];
  careerYearlyStats: CareerYearlyStat[];
  onFilterChange: (filters: Partial<GlobalFilters>) => void;
}

export const CareersComparisonView: React.FC<CareersComparisonViewProps> = ({
  careers,
  careerYearlyStats,
  onFilterChange,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Tabla Comparativa Institucional Oficial (Punto 10) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-700" />
              Matriz Comparativa de Producción por Carrera y Unidad Académica
            </h3>
            <p className="text-xs text-slate-500">
              Comparación integral de documentos, autores participantes, líneas científicas y metas ODS
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg">
            {careers.length} carreras evaluadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Carrera / Unidad Académica</th>
                <th className="p-3.5 text-right">Documentos</th>
                <th className="p-3.5 text-right">Autores Únicos</th>
                <th className="p-3.5 text-right">Líneas de Inv.</th>
                <th className="p-3.5 text-right">ODS Abordados</th>
                <th className="p-3.5 text-right">Tesis (PFG)</th>
                <th className="p-3.5 text-right">Artículos/Inv.</th>
                <th className="p-3.5 text-right">% Repositorio</th>
                <th className="p-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {careers.map((c) => (
                <tr key={c.career} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-sm">{c.career}</span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-extrabold text-blue-900 text-sm">
                    {c.documentsCount}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-purple-800">
                    {c.uniqueAuthorsCount}
                  </td>
                  <td className="p-3.5 text-right font-mono font-semibold text-amber-700">
                    {c.researchLinesCount}
                  </td>
                  <td className="p-3.5 text-right font-mono font-semibold text-emerald-700">
                    {c.odsCount}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-700">
                    {c.pfgCount}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-700">
                    {c.articlesCount}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                    {c.percentage}%
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onFilterChange({ career: c.career })}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs transition-colors"
                    >
                      <span>Filtrar</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Gráfico Comparativo de Documentos y Autores por Carrera */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            Comparación Visual: Documentos vs. Autores por Carrera
          </h3>
          <p className="text-xs text-slate-500">
            Relación de productividad y participación de autores entre carreras
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={careers}
              margin={{ top: 10, right: 30, left: -10, bottom: 25 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  onFilterChange({ career: e.activePayload[0].payload.career });
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="career"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => val.replace('Ingeniería ', 'Ing. ')}
              />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="documentsCount" name="Total Documentos" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="uniqueAuthorsCount" name="Autores Únicos" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
