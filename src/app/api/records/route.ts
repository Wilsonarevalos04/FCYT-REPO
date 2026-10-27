import { NextRequest, NextResponse } from 'next/server';
import { getAllRepositoryRecords, getRecordById } from '@/services/repositoryDb';
import { filterRecords } from '@/services/analyticsEngine';
import { GlobalFilters } from '@/types/oai';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Búsqueda de un registro específico
    const id = searchParams.get('id');
    if (id) {
      const record = getRecordById(id);
      if (!record) {
        return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
      }
      return NextResponse.json(record);
    }

    const filters: GlobalFilters = {
      query: searchParams.get('query') || undefined,
      career: searchParams.get('career') || undefined,
      collection: searchParams.get('collection') || undefined,
      docType: searchParams.get('docType') || undefined,
      researchLine: searchParams.get('researchLine') || undefined,
      ods: searchParams.get('ods') || undefined,
      author: searchParams.get('author') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined,
      startYear: searchParams.get('startYear') ? parseInt(searchParams.get('startYear')!, 10) : undefined,
      endYear: searchParams.get('endYear') ? parseInt(searchParams.get('endYear')!, 10) : undefined,
      language: searchParams.get('language') || undefined,
      qualityOnlyIncomplete: searchParams.get('qualityOnlyIncomplete') === 'true',
    };

    const sortBy = searchParams.get('sortBy') || 'date_desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const size = parseInt(searchParams.get('size') || '12', 10);

    const allRecords = getAllRepositoryRecords();
    const filtered = filterRecords(allRecords, filters);

    // Ordenamiento
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
      if (sortBy === 'author_asc') {
        const a1 = a.authors[0] || '';
        const b1 = b.authors[0] || '';
        return a1.localeCompare(b1);
      }
      return 0;
    });

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = (page - 1) * size;
    const paginatedItems = filtered.slice(startIndex, startIndex + size);

    return NextResponse.json({
      items: paginatedItems,
      totalElements,
      totalPages,
      currentPage: page,
      pageSize: size,
    });
  } catch (error) {
    console.error('Error en /api/records:', error);
    return NextResponse.json(
      { error: 'Error al consultar documentos del repositorio', details: (error as Error).message },
      { status: 500 }
    );
  }
}
