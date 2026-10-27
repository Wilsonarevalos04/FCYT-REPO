'use client';

import React from 'react';
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
  Legend,
} from 'recharts';
import {
  GraduationCap,
  FileCheck,
  Calendar,
  Layers,
  Sparkles,
  Award,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { RepositoryStats } from '@/types/dspace';

interface StatsDashboardProps {
  stats: RepositoryStats;
  onSelectYear?: (year: number) => void;
  onSelectCareer?: (career: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  onSelectYear,
  onSelectCareer,
}) => {
  const {
    totalItems,
    totalCareers,
    yearsRange,
    careerDistribution,
    yearlyDistribution,
    docTypeDistribution,
    topSubjects,
  } = stats;

  const pfgCount =
    docTypeDistribution.find((d) => d.docType.includes('Grado'))?.count || 232;

  // Custom tooltip para el gráfico de barras
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700">
          <p className="font-bold text-blue-300">Año {label}</p>
          <p className="font-semibold mt-1">
            {payload[0].value} publicaciones registradas
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Haz clic para ver las tesis de este año
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip para el gráfico de pastel
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = ((data.value / totalItems) * 100).toFixed(1);
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700">
          <p className="font-bold text-white">{data.name}</p>
          <p className="font-semibold text-blue-300 mt-1">
            {data.value} trabajos ({percent}%)
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Haz clic para ver publicaciones de esta carrera
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. CARDS DE MÉTRICAS CLAVE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Publicaciones */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Trabajos
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">
            {totalItems}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">100%</span> indexados en DSpace
          </p>
        </div>

        {/* Tesis de Grado (PFG) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tesis y PFG
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">
            {pfgCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proyectos Finales de Grado aprobados
          </p>
        </div>

        {/* Carreras Académicas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Carreras
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">
            {totalCareers}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ingenierías y departamentos
          </p>
        </div>

        {/* Periodo de Producción */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Periodo
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">
            {yearsRange.min}-{yearsRange.max}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {yearsRange.max - yearsRange.min + 1} años de producción académica
          </p>
        </div>
      </div>

      {/* 2. GRÁFICOS PRINCIPALES: BARRAS POR AÑO + PIE POR CARRERA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Barras: Publicaciones por Año */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                Cantidad de Publicaciones por Año
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evolución histórica de defensas de tesis e informes en FCyT
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
              2015 - 2026
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyDistribution}
                margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const yr = e.activePayload[0].payload.year;
                    if (onSelectYear) onSelectYear(yr);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="year"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Tip: Haz clic sobre cualquier barra para filtrar los resultados de ese año en el buscador.
          </p>
        </div>

        {/* Gráfico Circular: Distribución por Carrera */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-700" />
                  Distribución por Carrera
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proporción de tesis según la carrera de ingeniería
                </p>
              </div>
            </div>

            <div className="h-60 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={careerDistribution}
                    dataKey="count"
                    nameKey="career"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    className="cursor-pointer"
                    onClick={(entry: any) => {
                      if (onSelectCareer && entry && entry.career) {
                        onSelectCareer(entry.career);
                      }
                    }}
                  >
                    {careerDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {totalItems}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Tesis Totales
                </span>
              </div>
            </div>
          </div>

          {/* Leyenda interactiva personalizada */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {careerDistribution.map((entry) => (
              <button
                key={entry.career}
                type="button"
                onClick={() => onSelectCareer && onSelectCareer(entry.career)}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-left transition-colors"
                title={`Filtrar por ${entry.career}`}
              >
                <div className="flex items-center gap-2 truncate pr-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="truncate text-[11px] font-medium text-slate-700">
                    {entry.career.replace('Ingeniería ', 'Ing. ')}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-900">
                  {entry.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TÓPICOS Y OBJETIVOS ODS MÁS INVESTIGADOS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-700" />
              Líneas de Investigación y Objetivos ODS Principales
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Palabras clave y Objetivos de Desarrollo Sostenible más abordados en los trabajos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {topSubjects.map((sub, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
            >
              <div className="text-xs font-bold text-slate-900 line-clamp-2">
                {sub.subject}
              </div>
              <div className="text-[11px] font-mono font-semibold text-blue-700 mt-1">
                {sub.count} publicaciones
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
