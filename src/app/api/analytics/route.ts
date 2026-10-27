import { NextRequest, NextResponse } from 'next/server';
import { getAllRepositoryRecords } from '@/services/repositoryDb';
import { filterRecords, computeAnalytics } from '@/services/analyticsEngine';
import { GlobalFilters } from '@/types/oai';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

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

    const allRecords = getAllRepositoryRecords();
    const filtered = filterRecords(allRecords, filters);
    const report = computeAnalytics(filtered, allRecords.length, filters);

    return NextResponse.json(report, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error en /api/analytics:', error);
    return NextResponse.json(
      { error: 'Error al generar analítica del repositorio', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const filters: GlobalFilters = await request.json();
    const allRecords = getAllRepositoryRecords();
    const filtered = filterRecords(allRecords, filters || {});
    const report = computeAnalytics(filtered, allRecords.length, filters || {});

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error en POST /api/analytics:', error);
    return NextResponse.json(
      { error: 'Error al procesar filtros de analítica', details: (error as Error).message },
      { status: 500 }
    );
  }
}
