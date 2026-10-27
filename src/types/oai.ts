/**
 * Definiciones de tipos para el Sistema de Análisis y Dashboard del Repositorio DSpace FCyT-UNCA
 * basado en el protocolo OAI-PMH y metadatos Dublin Core / DIM.
 */

export interface OaiRecordMetadataQuality {
  hasAuthor: boolean;
  hasDate: boolean;
  hasAbstract: boolean;
  hasSubjects: boolean;
  hasResearchLine: boolean;
  hasOds: boolean;
  hasDocType: boolean;
  hasUri: boolean;
  hasPdf: boolean;
  completenessScore: number; // 0 a 100%
  missingFields: string[];
}

export interface RepositoryRecord {
  /** Identificador único de OAI-PMH (ej: oai:publicaciones.fctunca.edu.py:123456789/45) */
  identifier: string;
  /** Datestamp de OAI-PMH (ej: 2025-10-17T13:25:20Z) */
  datestamp: string;
  /** Handle institucional (ej: 123456789/45) */
  handle: string;
  /** Título del documento */
  title: string;
  /** Lista de autores/creadores */
  authors: string[];
  /** Asesor / Tutor si está disponible */
  advisors: string[];
  /** Fecha de publicación emitida */
  dateIssued: string;
  /** Año extraído de la fecha */
  year: number | null;
  /** Tipo de documento normalizado (PFG, Artículo, Tesis, Informe, etc.) */
  docType: string;
  /** Tipo de documento original en DSpace */
  rawType: string;
  /** Carrera o Departamento académico */
  career: string;
  /** Comunidad institucional en DSpace */
  community: string;
  /** Colección institucional en DSpace */
  collection: string;
  /** setSpecs de OAI-PMH */
  setSpecs: string[];
  /** Lista de materias / palabras clave */
  subjects: string[];
  /** Línea de investigación asociada */
  researchLine: string | null;
  /** Objetivos de Desarrollo Sostenible (ODS) asociados */
  ods: string[];
  /** Resumen analítico */
  abstract: string;
  /** Código de idioma (ej: spa, eng, por) */
  language: string;
  /** Enlace permanente URI (Handle) a DSpace */
  uri: string;
  /** Enlace directo a bitstream PDF si está disponible */
  pdfUrl: string | null;
  /** Tamaño del PDF en bytes */
  pdfSize: number | null;
  /** Nombre del archivo PDF */
  pdfName: string | null;
  /** Licencia y derechos de acceso */
  rights: string;
  /** Fecha en que fue importado por primera vez en la BD local */
  importedAt: string;
  /** Fecha de última actualización en la BD local */
  updatedAt: string;
  /** Evaluación de calidad de metadatos */
  quality: OaiRecordMetadataQuality;
  /** Metadatos crudos preservados como fuente inmutable */
  rawFields?: Record<string, string[]>;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  recordsFound: number;
  newCount: number;
  updatedCount: number;
  unchangedCount: number;
  errorCount: number;
  durationMs: number;
  details: string;
  errors?: string[];
}

export interface GlobalFilters {
  query?: string;
  career?: string;
  collection?: string;
  docType?: string;
  researchLine?: string;
  ods?: string;
  author?: string;
  year?: number | null;
  startYear?: number | null;
  endYear?: number | null;
  language?: string;
  qualityOnlyIncomplete?: boolean;
}

export interface KpiIndicators {
  totalDocuments: number;
  lastYearDocuments: number;
  lastYearLabel: number;
  annualGrowthRate: number; // Porcentaje de variación interanual
  totalAuthors: number;
  totalCollections: number;
  totalDocTypes: number;
  totalCareers: number;
  totalResearchLines: number;
  totalOds: number;
  avgMetadataScore: number; // % promedio de salud de metadatos
  totalPfg: number;
  totalArticles: number;
  totalReports: number;
}

export interface YearlyStat {
  year: number;
  count: number;
  percentage: number;
}

export interface CareerYearlyStat {
  year: number;
  [careerKey: string]: number | string;
}

export interface AuthorRankingItem {
  position: number;
  author: string;
  documentsCount: number;
  percentage: number;
  careers: string[];
  docTypes: string[];
  latestYear: number | null;
}

export interface CategoryCountItem {
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface ThematicRankingItem {
  name: string;
  count: number;
  percentage: number;
  topCareer?: string;
  relatedDocTypes?: string[];
}

export interface OdsRankingItem {
  odsNumber: number;
  odsCode: string;
  title: string;
  count: number;
  percentage: number;
  color: string;
  topCareer?: string;
}

export interface CareerComparativeItem {
  career: string;
  documentsCount: number;
  uniqueAuthorsCount: number;
  researchLinesCount: number;
  odsCount: number;
  pfgCount: number;
  articlesCount: number;
  percentage: number;
  color: string;
}

export interface MetadataAuditSummary {
  totalAnalyzed: number;
  perfectRecords: number; // 100% completos
  incompleteRecords: number;
  overallHealthPercentage: number;
  missingAuthorCount: number;
  missingDateCount: number;
  missingAbstractCount: number;
  missingSubjectsCount: number;
  missingResearchLineCount: number;
  missingOdsCount: number;
  missingDocTypeCount: number;
  missingPdfCount: number;
  byCareerQuality: { career: string; score: number; incompleteCount: number }[];
}

export interface CompleteAnalyticsReport {
  timestamp: string;
  totalAvailableInDb: number;
  filteredCount: number;
  kpis: KpiIndicators;
  temporalEvolution: {
    byYear: YearlyStat[];
    byCareerYear: CareerYearlyStat[];
    minYear: number;
    maxYear: number;
  };
  authorRanking: AuthorRankingItem[];
  docTypeDistribution: CategoryCountItem[];
  collectionDistribution: CategoryCountItem[];
  thematicAnalysis: {
    keywords: ThematicRankingItem[];
    researchLines: ThematicRankingItem[];
    ods: OdsRankingItem[];
  };
  careersComparison: CareerComparativeItem[];
  metadataAudit: MetadataAuditSummary;
  activeFilters: GlobalFilters;
}
