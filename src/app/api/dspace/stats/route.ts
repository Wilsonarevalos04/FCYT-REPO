import { NextResponse } from 'next/server';
import { getRepositoryStats } from '@/services/dspaceService';

export async function GET() {
  try {
    const stats = getRepositoryStats();
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error in /api/dspace/stats route:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del repositorio', details: (error as Error).message },
      { status: 500 }
    );
  }
}
