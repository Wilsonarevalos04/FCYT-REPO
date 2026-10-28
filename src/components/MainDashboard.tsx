'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  FileText,
  Users,
  GraduationCap,
  Layers,
  Sparkles,
  TrendingUp,
  Award,
  Globe,
  Calendar,
  ShieldCheck,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { CompleteAnalyticsReport, GlobalFilters } from '@/types/oai';

interface MainDashboardProps {
  report: CompleteAnalyticsReport;
  onFilterChange: (filters: Partial<GlobalFilters>) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ report, onFilterChange }) => {
  const { kpis, temporalEvolution, docTypeDistribution, collectionDistribution, careersComparison, thematicAnalysis } = report;

  // Modo de visualización del gráfico temporal: 'all' | 'custom'
  const [temporalMode, setTemporalMode] = useState<'bars' | 'lines'>('bars');

  // Tooltip personalizado para barras
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700">
          <p className="font-bold text-blue-300">Año {label}</p>
          <p className="font-semibold mt-1">{payload[0].value} publicaciones registradas</p>
          <p className="text-[10px] text-slate-400 mt-1">Haz clic para filtrar por este año</p>
        </div>
      );
    }
    return null;
  };

  // Tooltip personalizado para pastel
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700">
          <p className="font-bold text-white">{data.name}</p>
          <p className="font-semibold text-blue-300 mt-1">
            {data.value} documentos ({data.payload?.percentage}%)
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Haz clic para filtrar</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. TARJETAS DE INDICADORES PRINCIPALES (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Documentos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Documentos</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {kpis.totalDocuments}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Catálogo OAI-PMH sincronizado</p>
          </div>
        </div>

        {/* Agregados en el último año */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Año {kpis.lastYearLabel}</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono flex items-baseline gap-1">
              <span>{kpis.lastYearDocuments}</span>
              {kpis.annualGrowthRate !== 0 && (
                <span
                  className={`text-[11px] font-semibold ${
                    kpis.annualGrowthRate > 0 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {kpis.annualGrowthRate > 0 ? `+${kpis.annualGrowthRate}%` : `${kpis.annualGrowthRate}%`}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Producción del último periodo</p>
          </div>
        </div>

        {/* Total Autores */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Autores</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {kpis.totalAuthors}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Tesistas e investigadores únicos</p>
          </div>
        </div>

        {/* Carreras Académicas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Carreras FCyT</span>
            <GraduationCap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {kpis.totalCareers}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Ingenierías y departamentos</p>
          </div>
        </div>

        {/* Líneas de Investigación */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Líneas Inv.</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {kpis.totalResearchLines}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Áreas de conocimiento</p>
          </div>
        </div>

        {/* Calidad de Metadatos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Salud Metadatos</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              {kpis.avgMetadataScore}%
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Completitud promedio</p>
          </div>
        </div>
      </div>

      {/* 2. EVOLUCIÓN TEMPORAL DE DOCUMENTOS (Punto 4 y 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Evolución Anual */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                Evolución Temporal de la Producción ({temporalEvolution.minYear} - {temporalEvolution.maxYear})
              </h3>
              <p className="text-xs text-slate-500">Cantidad de documentos registrados por año de publicación</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setTemporalMode('bars')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  temporalMode === 'bars' ? 'bg-white text-blue-800 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Barras
              </button>
              <button
                onClick={() => setTemporalMode('lines')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  temporalMode === 'lines' ? 'bg-white text-blue-800 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Línea
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {temporalMode === 'bars' ? (
                <BarChart
                  data={temporalEvolution.byYear}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length) {
                      onFilterChange({ year: e.activePayload[0].payload.year });
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="count"
                    fill="#1b60b8"
                    radius={[6, 6, 0, 0]}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                </BarChart>
              ) : (
                <LineChart
                  data={temporalEvolution.byYear}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length) {
                      onFilterChange({ year: e.activePayload[0].payload.year });
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1b60b8"
                    strokeWidth={3}
                    dot={{ fill: '#0c2340', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Tip interactivo: Haz clic sobre cualquier año para filtrar instantáneamente todo el dashboard.
          </p>
        </div>

        {/* Gráfico de Tesis por Carrera (Dona / Anillo) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-700" />
                Distribución por Carrera
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">{kpis.totalCareers} carreras</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Participación porcentual en la producción documental</p>

            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={careersComparison}
                    dataKey="documentsCount"
                    nameKey="career"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    className="cursor-pointer"
                    onClick={(entry: any) => {
                      if (entry && entry.career) onFilterChange({ career: entry.career });
                    }}
                  >
                    {careersComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 font-mono">{kpis.totalDocuments}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
              </div>
            </div>
          </div>

          {/* Leyenda interactiva */}
          <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-100 text-xs">
            {careersComparison.map((c) => (
              <button
                key={c.career}
                type="button"
                onClick={() => onFilterChange({ career: c.career })}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-left transition-colors"
                title={`Filtrar por ${c.career}`}
              >
                <div className="flex items-center gap-1.5 truncate pr-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="truncate text-[11px] text-slate-700 font-medium">
                    {c.career.replace('Ingeniería ', 'Ing. ')}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-900">{c.documentsCount}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TIPO DE DOCUMENTO Y COLECCIONES (Puntos 7 y 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Distribución por Tipo de Documento */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                Estadísticas por Tipo de Documento
              </h3>
              <p className="text-xs text-slate-500">Distribución documental del repositorio</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Tipo de Documento</th>
                  <th className="p-2.5 text-right">Cantidad</th>
                  <th className="p-2.5 text-right">Porcentaje</th>
                  <th className="p-2.5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docTypeDistribution.map((t) => (
                  <tr key={t.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 font-medium text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color || '#2563eb' }} />
                      <span>{t.name}</span>
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">{t.count}</td>
                    <td className="p-2.5 text-right font-mono text-slate-600">{t.percentage}%</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => onFilterChange({ docType: t.name })}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-0.5"
                      >
                        Filtrar <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribución por Colección */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-700" />
                Estadísticas por Colección DSpace
              </h3>
              <p className="text-xs text-slate-500">Volumen de producción acumulado por colección</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={collectionDistribution.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    onFilterChange({ collection: e.activePayload[0].payload.name });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  width={140}
                  tickFormatter={(val) => (val.length > 22 ? val.slice(0, 22) + '...' : val)}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. ANÁLISIS TEMÁTICO: LÍNEAS DE INVESTIGACIÓN Y ODS (Punto 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Líneas de Investigación */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Líneas de Investigación Predominantes
              </h3>
              <p className="text-xs text-slate-500">Áreas científicas con mayor cantidad de trabajos de grado</p>
            </div>
          </div>

          <div className="space-y-2">
            {thematicAnalysis.researchLines.slice(0, 5).map((line) => (
              <div
                key={line.name}
                onClick={() => onFilterChange({ researchLine: line.name })}
                className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="pr-2">
                  <div className="text-xs font-bold text-slate-900">{line.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Carrera predominante: <span className="font-semibold text-blue-700">{line.topCareer}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-blue-800">{line.count} docs</span>
                  <div className="text-[10px] text-slate-400 font-mono">{line.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución de ODS */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Objetivos de Desarrollo Sostenible (ODS)
              </h3>
              <p className="text-xs text-slate-500">Alineación de investigaciones con la Agenda 2030</p>
            </div>
          </div>

          <div className="space-y-2">
            {thematicAnalysis.ods.slice(0, 5).map((ods) => (
              <div
                key={ods.title}
                onClick={() => onFilterChange({ ods: ods.title })}
                className="p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <span
                    className="w-6 h-6 rounded-md text-white text-[11px] font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: ods.color }}
                  >
                    {ods.odsNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 truncate">{ods.title}</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-900 shrink-0">{ods.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
