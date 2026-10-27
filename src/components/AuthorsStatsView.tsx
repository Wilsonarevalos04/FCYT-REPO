'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  Download,
  X,
  FileText,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AuthorRankingItem, RepositoryRecord, GlobalFilters } from '@/types/oai';

interface AuthorsStatsViewProps {
  authors: AuthorRankingItem[];
  allRecords: RepositoryRecord[];
  onFilterChange: (filters: Partial<GlobalFilters>) => void;
  onOpenDocument: (record: RepositoryRecord) => void;
}

export const AuthorsStatsView: React.FC<AuthorsStatsViewProps> = ({
  authors,
  allRecords,
  onFilterChange,
  onOpenDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'alpha'>('desc');
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  // Filtrar y ordenar autores
  const processedAuthors = useMemo(() => {
    let result = authors;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.author.toLowerCase().includes(q));
    }

    const sorted = [...result];
    if (sortOrder === 'desc') {
      sorted.sort((a, b) => b.documentsCount - a.documentsCount || a.author.localeCompare(b.author));
    } else if (sortOrder === 'asc') {
      sorted.sort((a, b) => a.documentsCount - b.documentsCount || a.author.localeCompare(b.author));
    } else if (sortOrder === 'alpha') {
      sorted.sort((a, b) => a.author.localeCompare(b.author));
    }

    return sorted;
  }, [authors, searchQuery, sortOrder]);

  // Trabajos asociados al autor seleccionado
  const authorDocuments = useMemo(() => {
    if (!selectedAuthor) return [];
    return allRecords.filter((r) =>
      r.authors.some((a) => a.toLowerCase() === selectedAuthor.toLowerCase())
    );
  }, [selectedAuthor, allRecords]);

  // Top 10 autores para el gráfico horizontal
  const top10Authors = useMemo(() => {
    return [...authors].sort((a, b) => b.documentsCount - a.documentsCount).slice(0, 10);
  }, [authors]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado y Top Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Barras Horizontales: Autores Más Prolíficos */}
        <div className="lg:col-span-12 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-700" />
                Autores con Mayor Cantidad de Documentos Registrados
              </h3>
              <p className="text-xs text-slate-500">
                Ranking de investigadores y tesistas ordenado por frecuencia acumulada
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg">
              {authors.length} autores analizados
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10Authors}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setSelectedAuthor(e.activePayload[0].payload.author);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="author"
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  width={180}
                  tickFormatter={(val) => (val.length > 24 ? val.slice(0, 24) + '...' : val)}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} trabajos`, 'Total Documentos']}
                  labelFormatter={(name) => `Autor: ${name}`}
                />
                <Bar dataKey="documentsCount" fill="#8b5cf6" radius={[0, 6, 6, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Ordenamiento del Ranking */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar autor..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-slate-500 font-medium">Ordenar por:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setSortOrder('desc')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                sortOrder === 'desc' ? 'bg-white text-purple-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Mayor a menor ↓
            </button>
            <button
              onClick={() => setSortOrder('asc')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                sortOrder === 'asc' ? 'bg-white text-purple-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Menor a mayor ↑
            </button>
            <button
              onClick={() => setSortOrder('alpha')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                sortOrder === 'alpha' ? 'bg-white text-purple-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Alfabético (A-Z)
            </button>
          </div>
        </div>
      </div>

      {/* Tabla del Ranking de Autores */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-center w-16"># Pos</th>
                <th className="p-3">Autor</th>
                <th className="p-3 text-right">Trabajos</th>
                <th className="p-3 text-right">% Producción</th>
                <th className="p-3">Carreras Asociadas</th>
                <th className="p-3 text-center">Último Año</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedAuthors.slice(0, 50).map((a, idx) => (
                <tr key={a.author} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-center font-mono font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="p-3 font-semibold text-slate-900">
                    <span
                      onClick={() => setSelectedAuthor(a.author)}
                      className="cursor-pointer hover:text-purple-700 hover:underline"
                    >
                      {a.author}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-purple-800 text-sm">
                    {a.documentsCount}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600">
                    {a.percentage}%
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {a.careers.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {c.replace('Ingeniería ', 'Ing. ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono text-slate-500">
                    {a.latestYear || '-'}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedAuthor(a.author)}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 font-semibold text-[11px] transition-colors"
                    >
                      Ver Trabajos ({a.documentsCount})
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Panel de Detalle de Trabajos del Autor Seleccionado */}
      {selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-purple-200 uppercase tracking-wider block">
                  Ficha de Autor
                </span>
                <h3 className="text-lg font-bold">{selectedAuthor}</h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  {authorDocuments.length} documentos registrados en el repositorio
                </p>
              </div>
              <button
                onClick={() => setSelectedAuthor(null)}
                className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              {authorDocuments.map((doc) => (
                <div
                  key={doc.identifier}
                  className="p-4 rounded-2xl border border-slate-200/90 hover:border-purple-300 hover:bg-purple-50/20 transition-all space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                      {doc.career}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {doc.docType}
                    </span>
                    {doc.year && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500">
                        Año {doc.year}
                      </span>
                    )}
                  </div>

                  <h4
                    onClick={() => {
                      setSelectedAuthor(null);
                      onOpenDocument(doc);
                    }}
                    className="font-bold text-slate-900 hover:text-purple-700 cursor-pointer text-sm leading-snug"
                  >
                    {doc.title}
                  </h4>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>Coautores: {doc.authors.join(', ')}</span>
                  </div>

                  {doc.abstract && (
                    <p className="text-slate-600 line-clamp-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {doc.abstract}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        setSelectedAuthor(null);
                        onOpenDocument(doc);
                      }}
                      className="text-purple-700 hover:underline font-semibold"
                    >
                      Ver ficha completa →
                    </button>

                    {doc.uri && (
                      <a
                        href={doc.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-purple-700"
                      >
                        <span>DSpace</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAuthor(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
