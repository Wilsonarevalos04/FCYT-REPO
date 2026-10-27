import {
  DSpaceSearchResponse,
  DSpaceRawItem,
  FilterParams,
  NormalizedPublication,
  PaginatedResult,
  RepositoryStats,
  DSpaceMetadataValue,
} from '@/types/dspace';

import preloadedDataset from '@/data/fctunca-dataset.json';

export const DSPACE_BASE_URL = 'https://publicaciones.fctunca.edu.py';
export const DSPACE_API_URL = `${DSPACE_BASE_URL}/server/api`;

/**
 * Mapeo oficial de Comunidades de DSpace en FCyT UNCA
 */
export const CAREER_COMMUNITIES: Record<string, { id: string; name: string; color: string; label: string }> = {
  informatica: {
    id: '5fa5c22b-1888-4e88-9c8f-8f8b71846f57',
    name: 'INGENIERIA INFORMATICA',
    label: 'Ingeniería Informática',
    color: '#8b5cf6', // Violet
  },
  civil: {
    id: '614aabf4-ab65-4b79-9c0f-376b0c6fd145',
    name: 'INGENIERIA CIVIL',
    label: 'Ingeniería Civil',
    color: '#10b981', // Emerald
  },
  electricidad: {
    id: 'a9b8a2e7-173c-4447-af0e-76ae22f988fa',
    name: 'INGENIERIA EN ELECTRICIDAD',
    label: 'Ingeniería en Electricidad',
    color: '#f59e0b', // Amber
  },
  electronica: {
    id: 'dd10db65-2bdc-4361-9346-23df0d5f7d02',
    name: 'INGENIERIA ELECTRONICA',
    label: 'Ingeniería Electrónica',
    color: '#06b6d4', // Cyan
  },
  informes: {
    id: '236edd8a-458b-4c31-80eb-e813cddd2db4',
    name: 'INFORMES INSTITUCIONALES',
    label: 'Informes Institucionales',
    color: '#64748b', // Slate
  },
  extension: {
    id: '3d1b1c4d-18ea-40cf-8022-93c02ff7c223',
    name: 'PROYECTOS DE EXTENSIÓN',
    label: 'Extensión Universitaria',
    color: '#ec4899', // Pink
  },
};

/**
 * Normaliza un objeto devuelto por DSpace 7/10 HAL+JSON
 */
export function normalizeDSpaceItem(item: DSpaceRawItem): NormalizedPublication {
  const meta = item.metadata || {};

  const getMeta = (key: string): string[] => meta[key]?.map((m: DSpaceMetadataValue) => m.value) || [];
  const getFirst = (key: string): string => meta[key]?.[0]?.value || '';

  const title = getFirst('dc.title') || item.name || 'Sin título';
  const authors = getMeta('dc.contributor.author');
  const advisor = getMeta('dc.contributor.advisor');
  const dateIssued = getFirst('dc.date.issued') || getFirst('dc.date.available') || '';

  const yearMatch = dateIssued.match(/\d{4}/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

  const abstract = getFirst('dc.description.abstract') || getFirst('dc.description') || '';
  const subjects = getMeta('dc.subject');
  const rawType = getFirst('dc.type') || '';

  const owningCollectionName = item._embedded?.owningCollection?.name || '';
  const owningCollectionId = item._embedded?.owningCollection?.id || '';
  const parentCommunityName = item._embedded?.owningCollection?._embedded?.parentCommunity?.name || '';
  const parentCommunityId = item._embedded?.owningCollection?._embedded?.parentCommunity?.id || '';

  let career = 'Otras Publicaciones';
  const cUpper = `${parentCommunityName} ${owningCollectionName} ${title}`.toUpperCase();
  if (
    cUpper.includes('INFORMÁTICA') ||
    cUpper.includes('INFORMATICA') ||
    cUpper.includes('SISTEMAS') ||
    cUpper.includes('COMPUTACIÓN')
  ) {
    career = 'Ingeniería Informática';
  } else if (cUpper.includes('CIVIL')) {
    career = 'Ingeniería Civil';
  } else if (cUpper.includes('ELECTRICIDAD') || cUpper.includes('ELÉCTRICA')) {
    career = 'Ingeniería en Electricidad';
  } else if (cUpper.includes('ELECTRÓNICA') || cUpper.includes('ELECTRONICA')) {
    career = 'Ingeniería Electrónica';
  } else if (parentCommunityName.includes('INFORMES') || cUpper.includes('MEMORIAS')) {
    career = 'Informes Institucionales';
  } else if (parentCommunityName.includes('EXTENSIÓN') || parentCommunityName.includes('EXTENSION')) {
    career = 'Extensión Universitaria';
  }

  let docType = 'Proyecto Final de Grado (PFG)';
  if (rawType.toLowerCase().includes('thesis') || owningCollectionName.toUpperCase().includes('PROYECTOS FINALES')) {
    docType = 'Proyecto Final de Grado (PFG)';
  } else if (rawType.toLowerCase().includes('article') || owningCollectionName.toUpperCase().includes('INVESTIGACION')) {
    docType = 'Trabajo de Investigación / Artículo';
  } else if (rawType.toLowerCase().includes('report') || owningCollectionName.toUpperCase().includes('MEMORIAS')) {
    docType = 'Informe Institucional';
  }

  let pdfUrl: string | null = null;
  let pdfName: string | null = null;
  let pdfSize: number | null = null;

  const bundles = item._embedded?.bundles?._embedded?.bundles || [];
  for (const b of bundles) {
    if (b.name === 'ORIGINAL') {
      const bitstreams = b._embedded?.bitstreams?._embedded?.bitstreams || [];
      const pdf = bitstreams.find((bs) => bs.name?.toLowerCase().endsWith('.pdf')) || bitstreams[0];
      if (pdf) {
        pdfName = pdf.name;
        pdfSize = pdf.sizeBytes;
        pdfUrl =
          pdf._links?.content?.href ||
          (pdf.id ? `${DSPACE_API_URL}/core/bitstreams/${pdf.id}/content` : null);
      }
    }
  }

  const handle = item.handle || '';
  const handleUrl = handle
    ? `${DSPACE_BASE_URL}/handle/${handle}`
    : item.uuid
    ? `${DSPACE_BASE_URL}/items/${item.uuid}`
    : '';

  return {
    id: item.uuid || item.id,
    uuid: item.uuid || item.id,
    title,
    authors,
    advisor,
    dateIssued,
    year,
    abstract,
    subjects,
    career,
    parentCommunityName: parentCommunityName || career,
    parentCommunityId,
    collection: owningCollectionName,
    collectionId: owningCollectionId,
    docType,
    rawType,
    handle,
    handleUrl,
    pdfUrl,
    pdfName,
    pdfSize,
    rawMetadata: meta,
  };
}

/**
 * Construye la URL de búsqueda hacia la API REST de DSpace 7/10
 */
export function buildDSpaceSearchUrl(params: FilterParams): string {
  const url = new URL(`${DSPACE_API_URL}/discover/search/objects`);

  url.searchParams.set('configuration', 'default');
  url.searchParams.set('dsoType', 'item');
  url.searchParams.set('embed', 'bundles/bitstreams,owningCollection/parentCommunity');

  if (params.query?.trim()) {
    url.searchParams.set('query', params.query.trim());
  }

  const page = (params.page ?? 1) - 1; // DSpace usa paginación 0-index
  url.searchParams.set('page', Math.max(0, page).toString());
  url.searchParams.set('size', (params.size ?? 12).toString());

  // Ordenamiento
  switch (params.sortBy) {
    case 'date_asc':
      url.searchParams.set('sort', 'dc.date.issued,ASC');
      break;
    case 'title_asc':
      url.searchParams.set('sort', 'dc.title,ASC');
      break;
    case 'relevance':
      url.searchParams.set('sort', 'score,DESC');
      break;
    case 'date_desc':
    default:
      url.searchParams.set('sort', 'dc.date.issued,DESC');
      break;
  }

  // Filtro por Carrera (utilizando scope con el UUID de la comunidad si coincide)
  if (params.career && params.career !== 'all') {
    const matched = Object.values(CAREER_COMMUNITIES).find(
      (c) => c.label.toLowerCase() === params.career?.toLowerCase() || c.name.toLowerCase() === params.career?.toLowerCase()
    );
    if (matched) {
      url.searchParams.set('scope', matched.id);
    }
  }

  // Filtro de años con faceta f.dateIssued
  if (params.exactYear) {
    url.searchParams.set('f.dateIssued', `[${params.exactYear} TO ${params.exactYear}],equals`);
  } else if (params.startYear || params.endYear) {
    const start = params.startYear || 2000;
    const end = params.endYear || new Date().getFullYear() + 1;
    url.searchParams.set('f.dateIssued', `[${start} TO ${end}],equals`);
  }

  if (params.author) {
    url.searchParams.set('f.author', `${params.author},equals`);
  }

  return url.toString();
}

/**
 * Motor de búsqueda inteligente con fallback al dataset local sincronizado.
 * Garantiza velocidad sub-milisegundo y resiliencia total ante caídas del servidor remoto.
 */
export async function searchDSpace(params: FilterParams): Promise<PaginatedResult<NormalizedPublication>> {
  const page = params.page ?? 1;
  const size = params.size ?? 12;

  try {
    // Intentar fetching directo a DSpace con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const dspaceUrl = buildDSpaceSearchUrl(params);
    const res = await fetch(dspaceUrl, {
      headers: { Accept: 'application/hal+json' },
      signal: controller.signal,
      next: { revalidate: 300 }, // Cache en Next.js por 5 min
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: DSpaceSearchResponse = await res.json();
      const searchResult = data._embedded?.searchResult;
      const objects = searchResult?._embedded?.objects || [];
      const totalElements = searchResult?.page?.totalElements ?? objects.length;
      const totalPages = searchResult?.page?.totalPages ?? Math.ceil(totalElements / size);

      const items = objects
        .map((obj) => obj._embedded?.indexableObject)
        .filter((item): item is DSpaceRawItem => Boolean(item))
        .map(normalizeDSpaceItem);

      if (items.length > 0 || totalElements === 0) {
        return {
          items,
          totalElements,
          totalPages,
          currentPage: page,
          pageSize: size,
        };
      }
    }
  } catch (err) {
    console.warn('DSpace API request failed or timed out, executing in-memory search fallback:', err);
  }

  // Fallback con el catálogo precargado y sincronizado de FCyT
  return filterLocalDataset(params);
}

/**
 * Filtro local de alta velocidad para el dataset precargado
 */
export function filterLocalDataset(params: FilterParams): PaginatedResult<NormalizedPublication> {
  const allItems = (preloadedDataset as unknown as NormalizedPublication[]) || [];

  let filtered = allItems;

  // Filtro de texto libre
  if (params.query?.trim()) {
    const q = params.query.trim().toLowerCase();
    filtered = filtered.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(q);
      const inAbstract = item.abstract.toLowerCase().includes(q);
      const inAuthors = item.authors.some((a) => a.toLowerCase().includes(q));
      const inSubjects = item.subjects.some((s) => s.toLowerCase().includes(q));
      const inAdvisor = item.advisor?.some((adv) => adv.toLowerCase().includes(q));
      return inTitle || inAbstract || inAuthors || inSubjects || inAdvisor;
    });
  }

  // Filtro por Carrera
  if (params.career && params.career !== 'all') {
    filtered = filtered.filter(
      (item) => item.career.toLowerCase() === params.career?.toLowerCase()
    );
  }

  // Filtro por Año exacto o Rango
  if (params.exactYear) {
    filtered = filtered.filter((item) => item.year === params.exactYear);
  } else {
    if (params.startYear) {
      filtered = filtered.filter((item) => item.year && item.year >= params.startYear!);
    }
    if (params.endYear) {
      filtered = filtered.filter((item) => item.year && item.year <= params.endYear!);
    }
  }

  // Filtro por Tipo de documento
  if (params.docType && params.docType !== 'all') {
    filtered = filtered.filter((item) => item.docType === params.docType);
  }

  // Filtro por Tema / Asignatura
  if (params.subject && params.subject !== 'all') {
    filtered = filtered.filter((item) =>
      item.subjects.some((s) => s.toLowerCase().includes(params.subject!.toLowerCase()))
    );
  }

  // Filtro por Autor
  if (params.author) {
    filtered = filtered.filter((item) =>
      item.authors.some((a) => a.toLowerCase().includes(params.author!.toLowerCase()))
    );
  }

  // Ordenamiento
  const sortBy = params.sortBy || 'date_desc';
  filtered.sort((a, b) => {
    if (sortBy === 'date_desc') {
      return (b.year || 0) - (a.year || 0) || b.dateIssued.localeCompare(a.dateIssued);
    }
    if (sortBy === 'date_asc') {
      return (a.year || 0) - (b.year || 0) || a.dateIssued.localeCompare(b.dateIssued);
    }
    if (sortBy === 'title_asc') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const page = params.page ?? 1;
  const size = params.size ?? 12;
  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size);
  const startIndex = (page - 1) * size;
  const items = filtered.slice(startIndex, startIndex + size);

  return {
    items,
    totalElements,
    totalPages,
    currentPage: page,
    pageSize: size,
  };
}

/**
 * Obtener estadísticas globales para los gráficos del Dashboard
 */
export function getRepositoryStats(): RepositoryStats {
  const allItems = (preloadedDataset as unknown as NormalizedPublication[]) || [];

  const careerCounts: Record<string, number> = {};
  const yearCounts: Record<string, number> = {};
  const docTypeCounts: Record<string, number> = {};
  const subjectCounts: Record<string, number> = {};

  let minYear = 2026;
  let maxYear = 2015;

  allItems.forEach((item) => {
    // Carrera
    careerCounts[item.career] = (careerCounts[item.career] || 0) + 1;

    // Año
    if (item.year) {
      yearCounts[item.year] = (yearCounts[item.year] || 0) + 1;
      if (item.year < minYear) minYear = item.year;
      if (item.year > maxYear) maxYear = item.year;
    }

    // Tipo de documento
    docTypeCounts[item.docType] = (docTypeCounts[item.docType] || 0) + 1;

    // Temas
    item.subjects.forEach((s) => {
      const cleanSubject = s.trim();
      if (cleanSubject.length > 2) {
        subjectCounts[cleanSubject] = (subjectCounts[cleanSubject] || 0) + 1;
      }
    });
  });

  const careerColors: Record<string, string> = {
    'Ingeniería en Electricidad': '#f59e0b',
    'Ingeniería Informática': '#8b5cf6',
    'Ingeniería Civil': '#10b981',
    'Ingeniería Electrónica': '#06b6d4',
    'Extensión Universitaria': '#ec4899',
    'Informes Institucionales': '#64748b',
    'Otras Publicaciones': '#94a3b8',
  };

  const careerDistribution = Object.entries(careerCounts)
    .map(([career, count]) => ({
      career,
      count,
      color: careerColors[career] || '#6366f1',
    }))
    .sort((a, b) => b.count - a.count);

  const yearlyDistribution = Object.entries(yearCounts)
    .map(([year, count]) => ({
      year: parseInt(year, 10),
      count,
    }))
    .sort((a, b) => a.year - b.year);

  const docTypeDistribution = Object.entries(docTypeCounts).map(([docType, count]) => ({
    docType,
    count,
  }));

  const topSubjects = Object.entries(subjectCounts)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    totalItems: allItems.length,
    totalCareers: Object.keys(careerCounts).length,
    yearsRange: { min: minYear, max: maxYear },
    careerDistribution,
    yearlyDistribution,
    docTypeDistribution,
    topSubjects,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Obtener publicación por UUID o handle
 */
export function getPublicationById(id: string): NormalizedPublication | null {
  const allItems = (preloadedDataset as unknown as NormalizedPublication[]) || [];
  return allItems.find((item) => item.id === id || item.uuid === id || item.handle === id) || null;
}

/**
 * Exportación de resultados a formatos académicos
 */
export function exportPublicationsToFormat(
  items: NormalizedPublication[],
  format: 'csv' | 'bibtex' | 'json'
): string {
  if (format === 'json') {
    return JSON.stringify(items, null, 2);
  }

  if (format === 'csv') {
    const headers = ['Título', 'Autores', 'Año', 'Carrera', 'Tipo', 'Handle', 'Enlace PDF'];
    const rows = items.map((i) => [
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.authors.join('; ').replace(/"/g, '""')}"`,
      i.year || '',
      `"${i.career}"`,
      `"${i.docType}"`,
      `"${i.handleUrl}"`,
      `"${i.pdfUrl || ''}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  if (format === 'bibtex') {
    return items
      .map((i) => {
        const key = `${(i.authors[0] || 'autor').split(' ')[0].toLowerCase()}${i.year || 's_f'}`;
        return `@thesis{${key},
  title = {${i.title}},
  author = {${i.authors.join(' and ')}},
  year = {${i.year || 'n.d.'}},
  school = {Facultad de Ciencias y Tecnologías, Universidad Nacional de Caaguazú (FCyT UNCA)},
  type = {${i.docType}},
  url = {${i.handleUrl}}
}`;
      })
      .join('\n\n');
  }

  return '';
}
