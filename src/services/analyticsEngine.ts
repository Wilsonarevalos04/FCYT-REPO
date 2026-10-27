import {
  RepositoryRecord,
  GlobalFilters,
  CompleteAnalyticsReport,
  KpiIndicators,
  YearlyStat,
  CareerYearlyStat,
  AuthorRankingItem,
  CategoryCountItem,
  ThematicRankingItem,
  OdsRankingItem,
  CareerComparativeItem,
  MetadataAuditSummary,
} from '@/types/oai';

// Paleta de colores institucional para Carreras
export const CAREER_COLORS: Record<string, string> = {
  'Ingeniería en Electricidad': '#f59e0b', // Ámbar
  'Ingeniería Informática': '#8b5cf6', // Violeta
  'Ingeniería Civil': '#10b981', // Esmeralda
  'Ingeniería Electrónica': '#06b6d4', // Cian
  'Extensión Universitaria': '#ec4899', // Rosa
  'Informes Institucionales': '#64748b', // Pizarra
  'Otras Publicaciones': '#94a3b8',
};

// Colores oficiales de la ONU para los ODS
export const ODS_COLORS: Record<number, string> = {
  1: '#e5243b',
  2: '#dda63a',
  3: '#4c9f38',
  4: '#c5192d',
  5: '#ff3a21',
  6: '#26bde2',
  7: '#fcc30b',
  8: '#a21942',
  9: '#fd6925',
  10: '#dd1367',
  11: '#fd9d24',
  12: '#bf8b2e',
  13: '#3f7e44',
  14: '#0a97d9',
  15: '#56c02b',
  16: '#00689d',
  17: '#19486a',
};

/**
 * Filtra los registros según los filtros globales activos
 */
export function filterRecords(
  records: RepositoryRecord[],
  filters: GlobalFilters
): RepositoryRecord[] {
  let result = records;

  // 1. Búsqueda libre
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter((r) => {
      const inTitle = r.title.toLowerCase().includes(q);
      const inAuthors = r.authors.some((a) => a.toLowerCase().includes(q));
      const inAbstract = r.abstract.toLowerCase().includes(q);
      const inSubjects = r.subjects.some((s) => s.toLowerCase().includes(q));
      const inIdentifier = r.identifier.toLowerCase().includes(q) || r.handle.toLowerCase().includes(q);
      const inLine = r.researchLine ? r.researchLine.toLowerCase().includes(q) : false;
      return inTitle || inAuthors || inAbstract || inSubjects || inIdentifier || inLine;
    });
  }

  // 2. Filtro por Carrera
  if (filters.career && filters.career !== 'all') {
    result = result.filter(
      (r) => r.career.toLowerCase() === filters.career?.toLowerCase()
    );
  }

  // 3. Filtro por Colección
  if (filters.collection && filters.collection !== 'all') {
    result = result.filter(
      (r) => r.collection.toLowerCase() === filters.collection?.toLowerCase()
    );
  }

  // 4. Filtro por Tipo de Documento
  if (filters.docType && filters.docType !== 'all') {
    result = result.filter(
      (r) => r.docType.toLowerCase() === filters.docType?.toLowerCase()
    );
  }

  // 5. Filtro por Línea de Investigación
  if (filters.researchLine && filters.researchLine !== 'all') {
    result = result.filter(
      (r) => r.researchLine && r.researchLine.toLowerCase() === filters.researchLine?.toLowerCase()
    );
  }

  // 6. Filtro por ODS
  if (filters.ods && filters.ods !== 'all') {
    result = result.filter((r) =>
      r.ods.some((o) => o.toLowerCase().includes(filters.ods!.toLowerCase()))
    );
  }

  // 7. Filtro por Autor
  if (filters.author && filters.author !== 'all') {
    result = result.filter((r) =>
      r.authors.some((a) => a.toLowerCase().includes(filters.author!.toLowerCase()))
    );
  }

  // 8. Filtro por Año específico o intervalo
  if (filters.year) {
    result = result.filter((r) => r.year === filters.year);
  } else {
    if (filters.startYear) {
      result = result.filter((r) => r.year !== null && r.year >= filters.startYear!);
    }
    if (filters.endYear) {
      result = result.filter((r) => r.year !== null && r.year <= filters.endYear!);
    }
  }

  // 9. Filtro por Idioma
  if (filters.language && filters.language !== 'all') {
    result = result.filter((r) => r.language.toLowerCase() === filters.language?.toLowerCase());
  }

  // 10. Filtro solo registros con metadatos incompletos (Control de Calidad)
  if (filters.qualityOnlyIncomplete) {
    result = result.filter((r) => r.quality.completenessScore < 100);
  }

  return result;
}

/**
 * Motor de Cálculo Estadístico y Analítico
 * Transforma los registros bibliográficos en indicadores y agregaciones
 */
export function computeAnalytics(
  filteredRecords: RepositoryRecord[],
  totalDbRecordsCount: number,
  filters: GlobalFilters
): CompleteAnalyticsReport {
  const total = filteredRecords.length;

  // 1. Recolección de frecuencias y agrupaciones
  const yearsMap = new Map<number, number>();
  const careersMap = new Map<string, number>();
  const collectionsMap = new Map<string, number>();
  const docTypesMap = new Map<string, number>();
  const authorsMap = new Map<string, { count: number; careers: Set<string>; docTypes: Set<string>; latestYear: number }>();
  const keywordsMap = new Map<string, { count: number; careers: Map<string, number> }>();
  const researchLinesMap = new Map<string, { count: number; careers: Map<string, number>; docTypes: Set<string> }>();
  const odsMap = new Map<string, { count: number; careers: Map<string, number>; odsNumber: number }>();

  // Matriz cruzada Año x Carrera
  const yearCareerMatrix = new Map<number, Map<string, number>>();

  // Métricas de calidad
  let totalScore = 0;
  let perfectCount = 0;
  let missingAuthor = 0;
  let missingDate = 0;
  let missingAbstract = 0;
  let missingSubjects = 0;
  let missingResearchLine = 0;
  let missingOds = 0;
  let missingDocType = 0;
  let missingPdf = 0;
  const careerQualityMap = new Map<string, { totalScore: number; count: number; incomplete: number }>();

  // Tipos de documento específicos
  let pfgCount = 0;
  let articlesCount = 0;
  let reportsCount = 0;

  for (const r of filteredRecords) {
    // Año
    if (r.year) {
      yearsMap.set(r.year, (yearsMap.get(r.year) || 0) + 1);

      if (!yearCareerMatrix.has(r.year)) {
        yearCareerMatrix.set(r.year, new Map());
      }
      const cRow = yearCareerMatrix.get(r.year)!;
      cRow.set(r.career, (cRow.get(r.career) || 0) + 1);
    }

    // Carrera
    careersMap.set(r.career, (careersMap.get(r.career) || 0) + 1);

    // Colección
    collectionsMap.set(r.collection, (collectionsMap.get(r.collection) || 0) + 1);

    // Tipo de documento
    docTypesMap.set(r.docType, (docTypesMap.get(r.docType) || 0) + 1);
    if (r.docType.includes('Grado')) pfgCount++;
    else if (r.docType.includes('Investigación') || r.docType.includes('Artículo')) articlesCount++;
    else if (r.docType.includes('Informe')) reportsCount++;

    // Autores (Contabilización justa para cada coautor individual)
    for (const a of r.authors) {
      const cleanAuthor = a.trim();
      if (!cleanAuthor) continue;
      if (!authorsMap.has(cleanAuthor)) {
        authorsMap.set(cleanAuthor, {
          count: 0,
          careers: new Set(),
          docTypes: new Set(),
          latestYear: r.year || 0,
        });
      }
      const aData = authorsMap.get(cleanAuthor)!;
      aData.count++;
      aData.careers.add(r.career);
      aData.docTypes.add(r.docType);
      if (r.year && r.year > aData.latestYear) aData.latestYear = r.year;
    }

    // Palabras clave
    for (const s of r.subjects) {
      const cleanSub = s.trim();
      if (!cleanSub) continue;
      if (!keywordsMap.has(cleanSub)) {
        keywordsMap.set(cleanSub, { count: 0, careers: new Map() });
      }
      const kwData = keywordsMap.get(cleanSub)!;
      kwData.count++;
      kwData.careers.set(r.career, (kwData.careers.get(r.career) || 0) + 1);
    }

    // Líneas de investigación
    if (r.researchLine) {
      const line = r.researchLine.trim();
      if (!researchLinesMap.has(line)) {
        researchLinesMap.set(line, { count: 0, careers: new Map(), docTypes: new Set() });
      }
      const lineData = researchLinesMap.get(line)!;
      lineData.count++;
      lineData.careers.set(r.career, (lineData.careers.get(r.career) || 0) + 1);
      lineData.docTypes.add(r.docType);
    }

    // ODS
    for (const o of r.ods) {
      const cleanOds = o.trim();
      const numMatch = cleanOds.match(/\d+/);
      const odsNum = numMatch ? parseInt(numMatch[0], 10) : 0;
      if (!odsMap.has(cleanOds)) {
        odsMap.set(cleanOds, { count: 0, careers: new Map(), odsNumber: odsNum });
      }
      const odsData = odsMap.get(cleanOds)!;
      odsData.count++;
      odsData.careers.set(r.career, (odsData.careers.get(r.career) || 0) + 1);
    }

    // Calidad de metadatos
    totalScore += r.quality.completenessScore;
    if (r.quality.completenessScore === 100) perfectCount++;
    if (!r.quality.hasAuthor) missingAuthor++;
    if (!r.quality.hasDate) missingDate++;
    if (!r.quality.hasAbstract) missingAbstract++;
    if (!r.quality.hasSubjects) missingSubjects++;
    if (!r.quality.hasResearchLine) missingResearchLine++;
    if (!r.quality.hasOds) missingOds++;
    if (!r.quality.hasDocType) missingDocType++;
    if (!r.quality.hasPdf) missingPdf++;

    if (!careerQualityMap.has(r.career)) {
      careerQualityMap.set(r.career, { totalScore: 0, count: 0, incomplete: 0 });
    }
    const cq = careerQualityMap.get(r.career)!;
    cq.totalScore += r.quality.completenessScore;
    cq.count++;
    if (r.quality.completenessScore < 100) cq.incomplete++;
  }

  // 2. Ordenamiento Temporal
  const sortedYears = Array.from(yearsMap.entries()).sort((a, b) => a[0] - b[0]);
  const minYear = sortedYears.length > 0 ? sortedYears[0][0] : 2015;
  const maxYear = sortedYears.length > 0 ? sortedYears[sortedYears.length - 1][0] : 2026;

  const yearlyStats: YearlyStat[] = sortedYears.map(([year, count]) => ({
    year,
    count,
    percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
  }));

  // Agregación de evolución temporal cruzada por carrera
  const careerYearlyStats: CareerYearlyStat[] = sortedYears.map(([year]) => {
    const row: CareerYearlyStat = { year };
    const cMap = yearCareerMatrix.get(year) || new Map();
    for (const [careerName] of careersMap) {
      row[careerName] = cMap.get(careerName) || 0;
    }
    return row;
  });

  // Tasa de crecimiento del último año
  const lastYearCount = yearsMap.get(maxYear) || 0;
  const prevYearCount = yearsMap.get(maxYear - 1) || 0;
  const annualGrowthRate =
    prevYearCount > 0
      ? parseFloat((((lastYearCount - prevYearCount) / prevYearCount) * 100).toFixed(1))
      : 0;

  // 3. Ranking de Autores (ordenado por frecuencia)
  const authorRanking: AuthorRankingItem[] = Array.from(authorsMap.entries())
    .map(([author, data]) => ({
      position: 0,
      author,
      documentsCount: data.count,
      percentage: total > 0 ? parseFloat(((data.count / total) * 100).toFixed(1)) : 0,
      careers: Array.from(data.careers),
      docTypes: Array.from(data.docTypes),
      latestYear: data.latestYear || null,
    }))
    .sort((a, b) => b.documentsCount - a.documentsCount || a.author.localeCompare(b.author))
    .map((item, index) => ({ ...item, position: index + 1 }));

  // 4. Distribución por Tipo de Documento
  const docTypeDistribution: CategoryCountItem[] = Array.from(docTypesMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
      color:
        name.includes('Grado')
          ? '#2563eb'
          : name.includes('Investigación')
          ? '#10b981'
          : name.includes('Informe')
          ? '#64748b'
          : '#ec4899',
    }))
    .sort((a, b) => b.count - a.count);

  // 5. Distribución por Colección
  const collectionDistribution: CategoryCountItem[] = Array.from(collectionsMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 6. Palabras Clave (Top)
  const keywordsRanking: ThematicRankingItem[] = Array.from(keywordsMap.entries())
    .map(([name, data]) => {
      let topCareer = 'General';
      let maxC = 0;
      data.careers.forEach((cCount, cName) => {
        if (cCount > maxC) {
          maxC = cCount;
          topCareer = cName;
        }
      });
      return {
        name,
        count: data.count,
        percentage: total > 0 ? parseFloat(((data.count / total) * 100).toFixed(1)) : 0,
        topCareer,
      };
    })
    .sort((a, b) => b.count - a.count);

  // 7. Líneas de Investigación
  const researchLinesRanking: ThematicRankingItem[] = Array.from(researchLinesMap.entries())
    .map(([name, data]) => {
      let topCareer = 'Interdisciplinaria';
      let maxC = 0;
      data.careers.forEach((cCount, cName) => {
        if (cCount > maxC) {
          maxC = cCount;
          topCareer = cName;
        }
      });
      return {
        name,
        count: data.count,
        percentage: total > 0 ? parseFloat(((data.count / total) * 100).toFixed(1)) : 0,
        topCareer,
        relatedDocTypes: Array.from(data.docTypes),
      };
    })
    .sort((a, b) => b.count - a.count);

  // 8. ODS Ranking
  const odsRanking: OdsRankingItem[] = Array.from(odsMap.entries())
    .map(([odsTitle, data]) => {
      let topCareer = 'Interdisciplinaria';
      let maxC = 0;
      data.careers.forEach((cCount, cName) => {
        if (cCount > maxC) {
          maxC = cCount;
          topCareer = cName;
        }
      });
      return {
        odsNumber: data.odsNumber,
        odsCode: `ODS ${data.odsNumber}`,
        title: odsTitle,
        count: data.count,
        percentage: total > 0 ? parseFloat(((data.count / total) * 100).toFixed(1)) : 0,
        color: ODS_COLORS[data.odsNumber] || '#2563eb',
        topCareer,
      };
    })
    .sort((a, b) => b.count - a.count);

  // 9. Tabla Comparativa por Carrera
  const careersComparison: CareerComparativeItem[] = Array.from(careersMap.entries())
    .map(([career, documentsCount]) => {
      // Filtrar registros específicos de esta carrera
      const cRecs = filteredRecords.filter((r) => r.career === career);
      const uniqueAuthors = new Set<string>();
      const lines = new Set<string>();
      const cOds = new Set<string>();
      let cPfg = 0;
      let cArticles = 0;

      cRecs.forEach((r) => {
        r.authors.forEach((a) => uniqueAuthors.add(a.trim()));
        if (r.researchLine) lines.add(r.researchLine.trim());
        r.ods.forEach((o) => cOds.add(o.trim()));
        if (r.docType.includes('Grado')) cPfg++;
        if (r.docType.includes('Investigación') || r.docType.includes('Artículo')) cArticles++;
      });

      return {
        career,
        documentsCount,
        uniqueAuthorsCount: uniqueAuthors.size,
        researchLinesCount: lines.size,
        odsCount: cOds.size,
        pfgCount: cPfg,
        articlesCount: cArticles,
        percentage: total > 0 ? parseFloat(((documentsCount / total) * 100).toFixed(1)) : 0,
        color: CAREER_COLORS[career] || '#6366f1',
      };
    })
    .sort((a, b) => b.documentsCount - a.documentsCount);

  // 10. Auditoría de Calidad
  const avgMetadataScore = total > 0 ? parseFloat((totalScore / total).toFixed(1)) : 100;
  const metadataAudit: MetadataAuditSummary = {
    totalAnalyzed: total,
    perfectRecords: perfectCount,
    incompleteRecords: total - perfectCount,
    overallHealthPercentage: avgMetadataScore,
    missingAuthorCount: missingAuthor,
    missingDateCount: missingDate,
    missingAbstractCount: missingAbstract,
    missingSubjectsCount: missingSubjects,
    missingResearchLineCount: missingResearchLine,
    missingOdsCount: missingOds,
    missingDocTypeCount: missingDocType,
    missingPdfCount: missingPdf,
    byCareerQuality: Array.from(careerQualityMap.entries()).map(([career, data]) => ({
      career,
      score: data.count > 0 ? parseFloat((data.totalScore / data.count).toFixed(1)) : 100,
      incompleteCount: data.incomplete,
    })),
  };

  // KPIs
  const kpis: KpiIndicators = {
    totalDocuments: total,
    lastYearDocuments: lastYearCount,
    lastYearLabel: maxYear,
    annualGrowthRate,
    totalAuthors: authorsMap.size,
    totalCollections: collectionsMap.size,
    totalDocTypes: docTypesMap.size,
    totalCareers: careersMap.size,
    totalResearchLines: researchLinesMap.size,
    totalOds: odsMap.size,
    avgMetadataScore,
    totalPfg: pfgCount,
    totalArticles: articlesCount,
    totalReports: reportsCount,
  };

  return {
    timestamp: new Date().toISOString(),
    totalAvailableInDb: totalDbRecordsCount,
    filteredCount: total,
    kpis,
    temporalEvolution: {
      byYear: yearlyStats,
      byCareerYear: careerYearlyStats,
      minYear,
      maxYear,
    },
    authorRanking,
    docTypeDistribution,
    collectionDistribution,
    thematicAnalysis: {
      keywords: keywordsRanking,
      researchLines: researchLinesRanking,
      ods: odsRanking,
    },
    careersComparison,
    metadataAudit,
    activeFilters: filters,
  };
}
