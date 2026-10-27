'use client';

import React from 'react';
import {
  Server,
  Code2,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export const ApiDocsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn text-slate-800">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-8 rounded-3xl shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            DSpace 10.0 HAL+JSON Verificado
          </span>
          <span className="text-xs text-blue-200 font-mono">
            Host: publicaciones.fctunca.edu.py
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Arquitectura de Integración con DSpace FCyT
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Documentación técnica del diseño de software, análisis de la API REST de DSpace 7/10, manejo de metadatos Dublin Core y estrategia Backend-for-Frontend (BFF) implementada en Next.js.
        </p>
      </div>

      {/* 1. Diagnóstico de Versión y Hallazgos */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Verificación del Endpoint y Versión de DSpace
            </h3>
            <p className="text-xs text-slate-500">
              Pruebas realizadas contra el servidor oficial de la universidad
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>/server/api (DSpace 7 / 10 REST API)</span>
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              <strong>Estado 200 OK</strong>. Devuelve cabecera <code className="font-mono bg-white px-1 py-0.5 rounded text-[11px]">application/hal+json</code>, con versión <code className="font-mono bg-white px-1 py-0.5 rounded text-[11px]">&quot;dspaceVersion&quot;: &quot;DSpace 10.0&quot;</code> y el catálogo de endpoints REST activos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>/rest (DSpace 6 Legacy) y CORS en Navegador</span>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              El endpoint antiguo <code className="font-mono bg-white px-1 py-0.5 rounded text-[11px]">/rest</code> retorna el index HTML de Angular. Además, las peticiones directas desde navegador bloquean con <strong>CORS 403 Forbidden</strong> debido a la política de origen de Spring Boot.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Solución Arquitectónica: Backend-for-Frontend (BFF) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Patrón Backend-for-Frontend (BFF) en Next.js
            </h3>
            <p className="text-xs text-slate-500">
              Por qué y cómo implementamos los Route Handlers de Next.js
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto space-y-2">
          <div className="text-slate-400">// Flujo de comunicación del sistema:</div>
          <div>Cliente (React UI) ──&gt; Next.js App Router (/api/dspace/search)</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼ (Petición Server-to-Server, Sin CORS)</div>
          <div>Next.js BFF Server ──&gt; DSpace 10.0 (/server/api/discover/search/objects)</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ (Normaliza metadatos Dublin Core y caché)</div>
          <div>Cliente recibe JSON tipado con links directos a PDF y metadatos limpios!</div>
        </div>
      </div>

      {/* 3. Deep Embedding en DSpace 7/10: Bitstreams y Carreras */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Optimización con Deep Embedding (HAL)
            </h3>
            <p className="text-xs text-slate-500">
              Eliminación del problema N+1 mediante el parámetro embed
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Para evitar hacer cientos de peticiones para averiguar el PDF de cada tesis y a qué carrera pertenece, utilizamos la directiva de embedding de DSpace 7+:
        </p>

        <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs text-blue-900 break-all">
          ?embed=bundles/bitstreams,owningCollection/parentCommunity
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">
              bundles/bitstreams:
            </span>
            <span className="text-slate-600">
              Permite extraer el archivo PDF original, su tamaño en bytes y la URL directa de descarga sin llamadas adicionales.
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">
              owningCollection/parentCommunity:
            </span>
            <span className="text-slate-600">
              Permite identificar si la tesis pertenece a Ingeniería Informática, Civil, Electricidad o Electrónica de forma instantánea.
            </span>
          </div>
        </div>
      </div>

      {/* 4. Mapeo de Metadatos Dublin Core */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            4
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Mapeo de Metadatos Dublin Core en TypeScript
            </h3>
            <p className="text-xs text-slate-500">
              Estructura tipada en <code className="font-mono">src/types/dspace.ts</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Campo Dublin Core (DSpace)</th>
                <th className="p-3">Campo Normalizado (App)</th>
                <th className="p-3">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="p-3 text-blue-700">dc.title</td>
                <td className="p-3 text-emerald-700">title</td>
                <td className="p-3 text-slate-600 font-sans">Título completo del trabajo de grado</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-700">dc.contributor.author</td>
                <td className="p-3 text-emerald-700">authors: string[]</td>
                <td className="p-3 text-slate-600 font-sans">Autores y tesistas de la investigación</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-700">dc.contributor.advisor</td>
                <td className="p-3 text-emerald-700">advisor: string[]</td>
                <td className="p-3 text-slate-600 font-sans">Profesor(a) tutor(a) o asesor(a) de tesis</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-700">dc.date.issued</td>
                <td className="p-3 text-emerald-700">dateIssued, year</td>
                <td className="p-3 text-slate-600 font-sans">Año y fecha de defensa y aprobación</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-700">dc.description.abstract</td>
                <td className="p-3 text-emerald-700">abstract</td>
                <td className="p-3 text-slate-600 font-sans">Resumen ejecutivo y metodológico</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-700">dc.subject</td>
                <td className="p-3 text-emerald-700">subjects: string[]</td>
                <td className="p-3 text-slate-600 font-sans">Palabras clave y Objetivos de Desarrollo ODS</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-700">dc.type</td>
                <td className="p-3 text-emerald-700">docType</td>
                <td className="p-3 text-slate-600 font-sans">Tipo de documento (PFG, Tesis, Artículo, Informe)</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-700">dc.identifier.uri</td>
                <td className="p-3 text-emerald-700">handleUrl</td>
                <td className="p-3 text-slate-600 font-sans">Enlace permanente al repositorio Handle de FCyT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
