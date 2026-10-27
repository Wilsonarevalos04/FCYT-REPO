import { NextRequest, NextResponse } from 'next/server';
import { searchDSpace } from '@/services/dspaceService';
import { FilterParams } from '@/types/dspace';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: FilterParams = {
      query: searchParams.get('query') || undefined,
      career: searchParams.get('career') || undefined,
      startYear: searchParams.get('startYear') ? parseInt(searchParams.get('startYear')!, 10) : undefined,
      endYear: searchParams.get('endYear') ? parseInt(searchParams.get('endYear')!, 10) : undefined,
      exactYear: searchParams.get('exactYear') ? parseInt(searchParams.get('exactYear')!, 10) : undefined,
      docType: searchParams.get('docType') || undefined,
      subject: searchParams.get('subject') || undefined,
      author: searchParams.get('author') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      size: searchParams.get('size') ? parseInt(searchParams.get('size')!, 10) : 12,
      sortBy: (searchParams.get('sortBy') as FilterParams['sortBy']) || 'date_desc',
    };

    const result = await searchDSpace(params);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error in /api/dspace/search route:', error);
    return NextResponse.json(
      { error: 'Error al buscar en el repositorio DSpace', details: (error as Error).message },
      { status: 500 }
    );
  }
}
