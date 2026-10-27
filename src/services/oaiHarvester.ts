import { XMLParser } from 'fast-xml-parser';
import { RepositoryRecord, OaiRecordMetadataQuality, SyncLog } from '@/types/oai';

export const OAI_ENDPOINT = 'https://publicaciones.fctunca.edu.py/server/oai/request';

/**
 * Mapeo de conjuntos de OAI-PMH (setSpec) a nombres institucionales
 */
export const SET_NAMES_MAP: Record<string, { name: string; type: 'community' | 'collection'; career?: string }> = {
  'com_123456789_10': { name: 'INGENIERIA CIVIL', type: 'community', career: 'Ingeniería Civil' },
  'com_123456789_3': { name: 'INGENIERIA INFORMATICA', type: 'community', career: 'Ingeniería Informática' },
  'com_123456789_13': { name: 'INGENIERIA EN ELECTRICIDAD', type: 'community', career: 'Ingeniería en Electricidad' },
  'com_123456789_7': { name: 'INGENIERIA ELECTRONICA', type: 'community', career: 'Ingeniería Electrónica' },
  'com_123456789_214': { name: 'INFORMES INSTITUCIONALES', type: 'community', career: 'Informes Institucionales' },
  'com_123456789_56': { name: 'PROYECTOS DE EXTENSIÓN', type: 'community', career: 'Extensión Universitaria' },
  'col_123456789_4': { name: 'PROYECTOS FINALES DE GRADO', type: 'collection', career: 'Ingeniería Informática' },
  'col_123456789_11': { name: 'PROYECTOS FINALES DE GRADO', type: 'collection', career: 'Ingeniería Civil' },
  'col_123456789_15': { name: 'PROYECTOS FINALES DE GRADO', type: 'collection', career: 'Ingeniería en Electricidad' },
  'col_123456789_8': { name: 'PROYECTOS FINALES DE GRADO', type: 'collection', career: 'Ingeniería Electrónica' },
  'col_123456789_5': { name: 'TRABAJOS DE INVESTIGACION', type: 'collection', career: 'Ingeniería Informática' },
  'col_123456789_14': { name: 'TRABAJOS DE INVESTIGACION', type: 'collection', career: 'Ingeniería Civil' },
  'col_123456789_16': { name: 'TRABAJOS DE INVESTIGACION', type: 'collection', career: 'Ingeniería en Electricidad' },
  'col_123456789_9': { name: 'TRABAJOS DE INVESTIGACION', type: 'collection', career: 'Ingeniería Electrónica' },
  'col_123456789_57': { name: 'PROYECTOS PARA LA COMUNIDAD', type: 'collection', career: 'Extensión Universitaria' },
  'col_123456789_215': { name: 'MEMORIAS Y CRONOLOGÍAS INSTITUCIONALES', type: 'collection', career: 'Informes Institucionales' },
};

/**
 * Líneas de investigación conocidas y validadas en la FCyT
 */
export const KNOWN_RESEARCH_LINES = [
  'Control y Automatización Industrial',
  'Distribución de Energía Eléctrica',
  'Transmisión de Energía Eléctrica',
  'Sistemas Mecatrónicos',
  'Ingeniería estructural mecánica y materiales',
  'Mecánica estructural',
  'Estructuras y Construcciones civiles',
  'Vías de Comunicación y Geotecnia',
  'Hidráulica y Sanitaria',
  'Ingeniería de Software y Sistemas Distribuidos',
  'Inteligencia Artificial y Ciencia de Datos',
  'Redes y Ciberseguridad',
  'Comunicaciones Industriales',
  'Energías Renovables y Eficiencia Energética',
  'Sistemas Embebidos e Internet de las Cosas',
];

/**
 * Petición HTTP simple con timeout
 */
async function fetchXml(url: string, timeoutMs = 25000): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FCyT-UNCA-Dashboard/2.0 (OAI-PMH Harvester)' },
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(id);
    if (!res.ok) {
      throw new Error(`OAI-PMH respondió con código de estado HTTP ${res.status}`);
    }
    return await res.text();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Evalúa la calidad e integridad de los metadatos de un registro
 */
export function evaluateMetadataQuality(record: Partial<RepositoryRecord>): OaiRecordMetadataQuality {
  const hasAuthor = Boolean(record.authors && record.authors.length > 0);
  const hasDate = Boolean(record.year && record.year > 1900);
  const hasAbstract = Boolean(record.abstract && record.abstract.trim().length > 30);
  const hasSubjects = Boolean(record.subjects && record.subjects.length > 0);
  const hasResearchLine = Boolean(record.researchLine && record.researchLine.trim().length > 0);
  const hasOds = Boolean(record.ods && record.ods.length > 0);
  const hasDocType = Boolean(record.docType && record.docType !== 'Otro');
  const hasUri = Boolean(record.uri && record.uri.includes('handle/'));
  const hasPdf = Boolean(record.pdfUrl);

  const missingFields: string[] = [];
  if (!hasAuthor) missingFields.push('Autor');
  if (!hasDate) missingFields.push('Fecha/Año');
  if (!hasAbstract) missingFields.push('Resumen');
  if (!hasSubjects) missingFields.push('Palabras clave');
  if (!hasResearchLine) missingFields.push('Línea de investigación');
  if (!hasOds) missingFields.push('ODS');
  if (!hasDocType) missingFields.push('Tipo de documento');
  if (!hasPdf) missingFields.push('Archivo PDF');

  // Ponderación de completitud
  let score = 0;
  if (hasAuthor) score += 20;
  if (hasDate) score += 15;
  if (hasAbstract) score += 15;
  if (hasSubjects) score += 15;
  if (hasDocType) score += 10;
  if (hasUri) score += 10;
  if (hasResearchLine) score += 5;
  if (hasOds) score += 5;
  if (hasPdf) score += 5;

  return {
    hasAuthor,
    hasDate,
    hasAbstract,
    hasSubjects,
    hasResearchLine,
    hasOds,
    hasDocType,
    hasUri,
    hasPdf,
    completenessScore: score,
    missingFields,
  };
}

/**
 * Normaliza un registro DIM de OAI-PMH
 */
export function parseOaiDimRecord(rawRecord: any): RepositoryRecord | null {
  const header = rawRecord?.header;
  if (!header || header['@_status'] === 'deleted') return null;

  const identifier: string = header.identifier || '';
  const datestamp: string = header.datestamp || new Date().toISOString();

  // setSpecs
  let setSpecs: string[] = [];
  if (header.setSpec) {
    setSpecs = Array.isArray(header.setSpec) ? header.setSpec : [header.setSpec];
  }

  // Extraer campos de metadata dim:dim
  const fields = rawRecord.metadata?.['dim:dim']?.['dim:field'] || [];
  const fieldsArray = Array.isArray(fields) ? fields : [fields];

  const getFields = (element: string, qualifier?: string): string[] => {
    return fieldsArray
      .filter((f: any) => {
        if (!f) return false;
        const elMatch = f['@_element'] === element;
        const qMatch = qualifier ? f['@_qualifier'] === qualifier : !f['@_qualifier'];
        return elMatch && qMatch;
      })
      .map((f: any) => String(typeof f === 'string' ? f : f['#text'] !== undefined ? f['#text'] : '').trim())
      .filter(Boolean);
  };

  const getAnyQualifier = (element: string): string[] => {
    return fieldsArray
      .filter((f: any) => f && f['@_element'] === element)
      .map((f: any) => String(typeof f === 'string' ? f : f['#text'] !== undefined ? f['#text'] : '').trim())
      .filter(Boolean);
  };

  const title = getFields('title')[0] || getAnyQualifier('title')[0] || 'Sin título';
  const authors = getFields('contributor', 'author');
  const advisors = getFields('contributor', 'advisor');
  const dateIssued = getFields('date', 'issued')[0] || getFields('date', 'accessioned')[0] || '';

  const yearMatch = dateIssued.match(/\d{4}/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

  const abstract = getFields('description', 'abstract')[0] || getFields('description')[0] || '';
  const allSubjects = getAnyQualifier('subject');
  const rawType = getFields('type')[0] || getAnyQualifier('type')[0] || 'Thesis';
  const uri = getFields('identifier', 'uri')[0] || getAnyQualifier('identifier')[0] || '';
  const language = getFields('language', 'iso')[0] || getAnyQualifier('language')[0] || 'spa';
  const rights = getFields('rights')[0] || getAnyQualifier('rights')[0] || 'Acceso abierto institucional';

  // Extraer Handle
  let handle = '';
  if (uri.includes('handle/')) {
    handle = uri.split('handle/')[1]?.replace(/[^0-9/]/g, '') || '';
  } else if (identifier.includes(':')) {
    const parts = identifier.split(':');
    handle = parts[parts.length - 1] || '';
  }

  // Determinar Comunidad, Colección y Carrera
  let career = 'Otras Publicaciones';
  let community = 'FACULTAD DE CIENCIAS Y TECNOLOGIAS';
  let collection = 'Colección General';

  for (const s of setSpecs) {
    const mapped = SET_NAMES_MAP[s];
    if (mapped) {
      if (mapped.type === 'community') community = mapped.name;
      if (mapped.type === 'collection') collection = mapped.name;
      if (mapped.career) career = mapped.career;
    }
  }

  // Inferencia adicional si no se resolvió por setSpecs
  const combinedContext = `${title} ${community} ${collection}`.toUpperCase();
  if (career === 'Otras Publicaciones') {
    if (combinedContext.includes('INFORMATICA') || combinedContext.includes('INFORMÁTICA') || combinedContext.includes('SISTEMAS')) {
      career = 'Ingeniería Informática';
    } else if (combinedContext.includes('CIVIL')) {
      career = 'Ingeniería Civil';
    } else if (combinedContext.includes('ELECTRICIDAD') || combinedContext.includes('ELÉCTRICA')) {
      career = 'Ingeniería en Electricidad';
    } else if (combinedContext.includes('ELECTRONICA') || combinedContext.includes('ELECTRÓNICA')) {
      career = 'Ingeniería Electrónica';
    }
  }

  // Normalizar Tipo de Documento
  let docType = 'Proyecto Final de Grado';
  const tUpper = `${rawType} ${collection}`.toUpperCase();
  if (tUpper.includes('PROYECTOS FINALES') || tUpper.includes('THESIS') || tUpper.includes('TESIS')) {
    docType = 'Proyecto Final de Grado';
  } else if (tUpper.includes('INVESTIGACION') || tUpper.includes('INVESTIGACIÓN') || tUpper.includes('ARTICLE') || tUpper.includes('ARTÍCULO')) {
    docType = 'Artículo / Trabajo de Investigación';
  } else if (tUpper.includes('INFORME') || tUpper.includes('MEMORIAS') || tUpper.includes('REPORT')) {
    docType = 'Informe Institucional';
  } else if (tUpper.includes('EXTENSIÓN') || tUpper.includes('EXTENSION') || tUpper.includes('COMUNIDAD')) {
    docType = 'Proyecto de Extensión';
  }

  // Clasificar Líneas de Investigación y ODS desde los subjects
  const ods: string[] = [];
  const subjectsClean: string[] = [];
  let researchLine: string | null = null;

  for (const sub of allSubjects) {
    const sTrim = sub.trim();
    if (sTrim.toUpperCase().startsWith('ODS')) {
      ods.push(sTrim);
    } else {
      subjectsClean.push(sTrim);
      // Chequear si coincide con alguna línea conocida
      if (!researchLine) {
        const foundLine = KNOWN_RESEARCH_LINES.find(
          (kl) => kl.toLowerCase() === sTrim.toLowerCase() || sTrim.toLowerCase().includes(kl.toLowerCase())
        );
        if (foundLine) {
          researchLine = foundLine;
        }
      }
    }
  }

  // Si no se asignó línea específica pero hay materias temáticas
  if (!researchLine && subjectsClean.length > 0) {
    researchLine = subjectsClean[0];
  }

  // Enlace PDF inferido de Handle DSpace bitstream estándar
  const pdfUrl = handle ? `https://publicaciones.fctunca.edu.py/server/api/core/bitstreams/by-handle/${handle}/content` : null;

  const now = new Date().toISOString();

  const recordDraft: Partial<RepositoryRecord> = {
    identifier,
    datestamp,
    handle,
    title,
    authors,
    advisors,
    dateIssued,
    year,
    docType,
    rawType,
    career,
    community,
    collection,
    setSpecs,
    subjects: subjectsClean,
    researchLine,
    ods,
    abstract,
    language,
    uri: uri || (handle ? `https://publicaciones.fctunca.edu.py/handle/${handle}` : ''),
    pdfUrl,
    pdfSize: null,
    pdfName: null,
    rights,
    importedAt: now,
    updatedAt: datestamp || now,
  };

  const quality = evaluateMetadataQuality(recordDraft);

  return {
    ...recordDraft,
    quality,
  } as RepositoryRecord;
}

/**
 * Cosechador completo OAI-PMH (Harvester)
 * Itera mediante resumptionTokens hasta descargar el repositorio completo
 */
export async function harvestCompleteOaiCatalog(
  onProgress?: (count: number, batch: number) => void
): Promise<{ records: RepositoryRecord[]; log: SyncLog }> {
  const t0 = Date.now();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

  const harvested: RepositoryRecord[] = [];
  const errors: string[] = [];

  let token: string | null = null;
  let batch = 0;

  try {
    do {
      const url = token
        ? `${OAI_ENDPOINT}?verb=ListRecords&resumptionToken=${encodeURIComponent(token)}`
        : `${OAI_ENDPOINT}?verb=ListRecords&metadataPrefix=dim`;

      const xml = await fetchXml(url);
      const doc = parser.parse(xml);

      const oaiError = doc['OAI-PMH']?.error;
      if (oaiError) {
        const errMsg = typeof oaiError === 'string' ? oaiError : oaiError['#text'] || JSON.stringify(oaiError);
        errors.push(`Error de protocolo OAI-PMH: ${errMsg}`);
        break;
      }

      const listRecords = doc['OAI-PMH']?.ListRecords;
      const rawRecords = listRecords?.record;
      const recordsArray = Array.isArray(rawRecords) ? rawRecords : rawRecords ? [rawRecords] : [];

      for (const raw of recordsArray) {
        try {
          const parsed = parseOaiDimRecord(raw);
          if (parsed) {
            harvested.push(parsed);
          }
        } catch (rErr) {
          errors.push(`Error al parsear registro individual: ${(rErr as Error).message}`);
        }
      }

      if (onProgress) {
        onProgress(harvested.length, batch);
      }

      const resToken = listRecords?.resumptionToken;
      token = typeof resToken === 'string' ? resToken.trim() : resToken?.['#text'] ? resToken['#text'].trim() : null;
      batch++;
    } while (token && batch < 20); // Guard limit de 20 lotes (2000 registros)

    const durationMs = Date.now() - t0;
    const log: SyncLog = {
      id: `sync_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: errors.length > 0 ? (harvested.length > 0 ? 'warning' : 'error') : 'success',
      recordsFound: harvested.length,
      newCount: harvested.length, // Calculado en el DB layer
      updatedCount: 0,
      unchangedCount: 0,
      errorCount: errors.length,
      durationMs,
      details: `Cosecha OAI-PMH completada exitosamente en ${batch} lote(s) en ${durationMs}ms`,
      errors: errors.length > 0 ? errors : undefined,
    };

    return { records: harvested, log };
  } catch (globalErr) {
    const durationMs = Date.now() - t0;
    const log: SyncLog = {
      id: `sync_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'error',
      recordsFound: harvested.length,
      newCount: 0,
      updatedCount: 0,
      unchangedCount: 0,
      errorCount: errors.length + 1,
      durationMs,
      details: `Fallo crítico en la sincronización OAI-PMH: ${(globalErr as Error).message}`,
      errors: [...errors, (globalErr as Error).message],
    };
    return { records: harvested, log };
  }
}
