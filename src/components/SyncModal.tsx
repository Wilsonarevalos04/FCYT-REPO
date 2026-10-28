'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Server,
  Calendar,
  Layers,
  Database,
  ArrowRight,
} from 'lucide-react';
import { SyncLog } from '@/types/oai';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastSyncAt: string | null;
  totalRecordsInDb: number;
  recentLogs: SyncLog[];
  onSyncCompleted: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  lastSyncAt,
  totalRecordsInDb,
  recentLogs,
  onSyncCompleted,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncLog | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setErrorMsg(null);
    setLastResult(null);

    try {
      const res = await fetch('/api/oai/sync', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        setLastResult(data.log);
        onSyncCompleted();
      } else {
        setErrorMsg(data.error || 'Error al conectar con el servidor OAI-PMH');
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0a1d37] to-[#1b60b8] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20 shrink-0">
              <Image
                src="/logo-fcyt.png"
                alt="Logo FCyT"
                width={36}
                height={36}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">Sincronización OAI-PMH</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-white/15 text-blue-100 border border-white/20">
                  FCyT
                </span>
              </div>
              <p className="text-xs text-blue-100/90">Protocolo de Cosecha DSpace 10.0</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Tarjeta de Estado Actual */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Registros en Base de Datos
              </span>
              <span className="text-xl font-black font-mono text-slate-900">
                {totalRecordsInDb} documentos
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Última Sincronización
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {lastSyncAt ? new Date(lastSyncAt).toLocaleString('es-PY') : 'No registrada'}
              </span>
            </div>
          </div>


          {/* Resultado de la sincronización en vivo */}
          {lastResult && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡Sincronización finalizada exitosamente!</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-xs">
                <div className="bg-white/80 p-2 rounded-xl">
                  <div className="text-[10px] uppercase text-slate-400">Nuevos</div>
                  <div className="font-bold text-emerald-700 text-sm">+{lastResult.newCount}</div>
                </div>
                <div className="bg-white/80 p-2 rounded-xl">
                  <div className="text-[10px] uppercase text-slate-400">Actualizados</div>
                  <div className="font-bold text-blue-700 text-sm">{lastResult.updatedCount}</div>
                </div>
                <div className="bg-white/80 p-2 rounded-xl">
                  <div className="text-[10px] uppercase text-slate-400">Sin Cambios</div>
                  <div className="font-bold text-slate-700 text-sm">{lastResult.unchangedCount}</div>
                </div>
              </div>
              <div className="text-[10px] text-emerald-800 text-right font-mono">
                Duración: {lastResult.durationMs}ms
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Historial de Sincronizaciones Anteriores (Punto 17) */}
          {recentLogs.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Historial de Sincronizaciones Recientes
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {recentLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">
                        {new Date(log.timestamp).toLocaleString('es-PY')}
                      </span>
                      <p className="text-[10px] text-slate-500">{log.details}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl"
          >
            Cerrar
          </button>

          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1b60b8] hover:bg-[#154c93] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Cosechando OAI-PMH...' : 'Sincronizar Ahora'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
