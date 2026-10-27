import fs from 'fs';
import path from 'path';
import { RepositoryRecord, SyncLog } from '@/types/oai';

const DB_FILE_PATH = path.join(process.cwd(), 'src/data/repository-db.json');
const LOGS_FILE_PATH = path.join(process.cwd(), 'src/data/sync-logs.json');

interface DatabaseSchema {
  version: string;
  lastSyncAt: string | null;
  totalRecords: number;
  records: RepositoryRecord[];
}

// Caché en memoria para alta velocidad con invalidación automática por mtime
let memoryDbCache: DatabaseSchema | null = null;
let lastDbMtime = 0;
let memoryLogsCache: SyncLog[] | null = null;

/**
 * Asegura la existencia de los archivos de base de datos
 */
function ensureStorageFiles() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE_PATH)) {
    const initialDb: DatabaseSchema = {
      version: '2.0',
      lastSyncAt: null,
      totalRecords: 0,
      records: [],
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
  }

  if (!fs.existsSync(LOGS_FILE_PATH)) {
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * Carga la base de datos de registros
 */
export function getRepositoryDatabase(): DatabaseSchema {
  ensureStorageFiles();

  try {
    const stat = fs.statSync(DB_FILE_PATH);
    if (memoryDbCache && stat.mtimeMs === lastDbMtime) {
      return memoryDbCache;
    }

    const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    memoryDbCache = JSON.parse(content) as DatabaseSchema;
    lastDbMtime = stat.mtimeMs;
    return memoryDbCache;
  } catch (err) {
    console.error('Error al leer repository-db.json:', err);
    return {
      version: '2.0',
      lastSyncAt: null,
      totalRecords: 0,
      records: [],
    };
  }
}

/**
 * Obtiene todos los registros bibliográficos
 */
export function getAllRepositoryRecords(): RepositoryRecord[] {
  const db = getRepositoryDatabase();
  return db.records || [];
}

/**
 * Obtiene un documento por su identificador OAI o por su handle
 */
export function getRecordById(idOrHandle: string): RepositoryRecord | null {
  const records = getAllRepositoryRecords();
  return (
    records.find(
      (r) =>
        r.identifier === idOrHandle ||
        r.handle === idOrHandle ||
        r.uri.endsWith(idOrHandle) ||
        r.identifier.endsWith(idOrHandle)
    ) || null
  );
}

/**
 * Obtiene el historial de registros de sincronización OAI-PMH
 */
export function getSyncLogs(): SyncLog[] {
  if (memoryLogsCache) {
    return memoryLogsCache;
  }

  ensureStorageFiles();

  try {
    const content = fs.readFileSync(LOGS_FILE_PATH, 'utf-8');
    memoryLogsCache = JSON.parse(content) as SyncLog[];
    return memoryLogsCache;
  } catch {
    return [];
  }
}

/**
 * Guarda y fusiona registros cosechados mediante OAI-PMH
 * Identifica registros nuevos, actualizados y sin cambios (deduplicación estricta)
 */
export function upsertHarvestedRecords(
  incomingRecords: RepositoryRecord[],
  baseLog: SyncLog
): SyncLog {
  const db = getRepositoryDatabase();
  const existingMap = new Map<string, RepositoryRecord>();

  for (const existing of db.records) {
    existingMap.set(existing.identifier, existing);
  }

  let newCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;
  const now = new Date().toISOString();

  const mergedRecords: RepositoryRecord[] = [];

  for (const incoming of incomingRecords) {
    const existing = existingMap.get(incoming.identifier);

    if (!existing) {
      // Registro nuevo
      newCount++;
      mergedRecords.push({
        ...incoming,
        importedAt: now,
        updatedAt: incoming.datestamp || now,
      });
    } else {
      // Comparar datestamp para determinar si hubo cambios
      if (existing.datestamp !== incoming.datestamp) {
        updatedCount++;
        mergedRecords.push({
          ...incoming,
          importedAt: existing.importedAt, // Conserva fecha original de importación
          updatedAt: incoming.datestamp || now,
        });
      } else {
        unchangedCount++;
        // Preserva datos existentes y actualiza si faltaba algún campo analítico
        mergedRecords.push({
          ...incoming,
          importedAt: existing.importedAt,
          updatedAt: existing.updatedAt,
        });
      }
      existingMap.delete(incoming.identifier);
    }
  }

  // Conservar registros previos que no vinieron en este lote (si fue parcial)
  for (const remaining of existingMap.values()) {
    mergedRecords.push(remaining);
  }

  // Actualizar base de datos
  const updatedDb: DatabaseSchema = {
    version: '2.0',
    lastSyncAt: now,
    totalRecords: mergedRecords.length,
    records: mergedRecords,
  };

  memoryDbCache = updatedDb;
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(updatedDb, null, 2), 'utf-8');

  // Registrar log de sincronización
  const finalLog: SyncLog = {
    ...baseLog,
    recordsFound: incomingRecords.length,
    newCount,
    updatedCount,
    unchangedCount,
    timestamp: now,
    details: `Sincronización completada: ${newCount} nuevos, ${updatedCount} actualizados, ${unchangedCount} sin cambios. Total en repositorio: ${mergedRecords.length}.`,
  };

  const logs = getSyncLogs();
  logs.unshift(finalLog);
  const trimmedLogs = logs.slice(0, 30); // Guardar últimos 30 logs

  memoryLogsCache = trimmedLogs;
  fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(trimmedLogs, null, 2), 'utf-8');

  return finalLog;
}
