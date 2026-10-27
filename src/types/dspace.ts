/**
 * Definiciones de tipos e interfaces para DSpace 7/10 HAL+JSON REST API
 * y el modelo de datos normalizado para el repositorio de tesis de FCyT UNCA.
 */

export interface DSpaceMetadataValue {
  value: string;
  language?: string | null;
  authority?: string | null;
  confidence?: number;
  place?: number;
}

export type DSpaceMetadataRecord = Record<string, DSpaceMetadataValue[] | undefined>;

export interface DSpaceHalLink {
  href: string;
}

export interface DSpacePageInfo {
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface DSpaceBitstream {
  id?: string;
  uuid?: string;
  name: string;
  sizeBytes: number;
  checkSum?: {
    checkSumAlgorithm: string;
    value: string;
  };
  _links?: {
    content?: DSpaceHalLink;
    format?: DSpaceHalLink;
    self?: DSpaceHalLink;
  };
}

export interface DSpaceBundle {
  name: 'ORIGINAL' | 'THUMBNAIL' | 'LICENSE' | string;
  id?: string;
  _embedded?: {
    bitstreams?: {
      _embedded?: {
        bitstreams?: DSpaceBitstream[];
      };
    };
  };
}

export interface DSpaceCommunity {
  id: string;
  uuid: string;
  name: string;
  handle?: string;
  type: 'community';
  _links?: Record<string, DSpaceHalLink>;
}

export interface DSpaceCollection {
  id: string;
  uuid: string;
  name: string;
  handle?: string;
  type: 'collection';
  _links?: Record<string, DSpaceHalLink>;
  _embedded?: {
    parentCommunity?: DSpaceCommunity;
  };
}

export interface DSpaceRawItem {
  id: string;
  uuid: string;
  name: string;
  handle?: string;
  type: 'item';
  metadata: DSpaceMetadataRecord;
  _links?: Record<string, DSpaceHalLink>;
  _embedded?: {
    bundles?: {
      _embedded?: {
        bundles?: DSpaceBundle[];
      };
    };
    owningCollection?: DSpaceCollection;
  };
}

export interface DSpaceSearchObject {
  dspaceObject?: DSpaceRawItem;
  _embedded?: {
    indexableObject?: DSpaceRawItem;
  };
}

export interface DSpaceFacetValue {
  label: string;
  count: number;
  authorityKey?: string | null;
  type?: string;
  _links?: {
    search?: DSpaceHalLink;
  };
}

export interface DSpaceFacet {
  name: string;
  facetType: string;
  _embedded?: {
    values?: DSpaceFacetValue[];
  };
}

export interface DSpaceSearchResponse {
  _embedded?: {
    searchResult?: {
      page: DSpacePageInfo;
      _embedded?: {
        objects: DSpaceSearchObject[];
      };
    };
    facets?: DSpaceFacet[];
  };
}

/**
 * Modelo de datos enriquecido y normalizado para el frontend
 */
export interface NormalizedPublication {
  id: string;
  uuid: string;
  title: string;
  authors: string[];
  advisor?: string[];
  dateIssued: string;
  year: number | null;
  abstract: string;
  subjects: string[];
  career: string;
  parentCommunityName: string;
  parentCommunityId?: string;
  collection: string;
  collectionId?: string;
  docType: string;
  rawType?: string;
  handle: string;
  handleUrl: string;
  pdfUrl: string | null;
  pdfName: string | null;
  pdfSize: number | null;
  rawMetadata?: DSpaceMetadataRecord;
}

export interface FilterParams {
  query?: string;
  career?: string;
  startYear?: number | null;
  endYear?: number | null;
  exactYear?: number | null;
  docType?: string;
  subject?: string;
  author?: string;
  page?: number;
  size?: number;
  sortBy?: 'date_desc' | 'date_asc' | 'title_asc' | 'relevance';
}

export interface PaginatedResult<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface CareerCount {
  career: string;
  count: number;
  color: string;
}

export interface YearCount {
  year: number;
  count: number;
}

export interface DocTypeCount {
  docType: string;
  count: number;
}

export interface RepositoryStats {
  totalItems: number;
  totalCareers: number;
  yearsRange: { min: number; max: number };
  careerDistribution: CareerCount[];
  yearlyDistribution: YearCount[];
  docTypeDistribution: DocTypeCount[];
  topSubjects: { subject: string; count: number }[];
  lastUpdated: string;
}
