import { NextRequest, NextResponse } from 'next/server';
import { harvestCompleteOaiCatalog } from '@/services/oaiHarvester';
import { upsertHarvestedRecords, getSyncLogs, getRepositoryDatabase } from '@/services/repositoryDb';

export async function GET() {
  try {
    const db = getRepositoryDatabase();
    const logs = getSyncLogs();
    return NextResponse.json({
      status: 'ok',
      lastSyncAt: db.lastSyncAt,
      totalRecords: db.totalRecords,
      recentLogs: logs.slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al consultar estado de sincronización', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[OAI-PMH] Iniciando cosecha solicitada por el usuario...');
    const harvestResult = await harvestCompleteOaiCatalog();

    if (harvestResult.records.length === 0 && harvestResult.log.status === 'error') {
      return NextResponse.json(
        {
          success: false,
          error: 'No se pudieron recuperar registros de OAI-PMH',
          log: harvestResult.log,
        },
        { status: 502 }
      );
    }

    // Persistir e identificar altas, modificaciones e invariantes
    const finalLog = upsertHarvestedRecords(harvestResult.records, harvestResult.log);
    const db = getRepositoryDatabase();

    return NextResponse.json({
      success: true,
      log: finalLog,
      totalRecordsInDb: db.totalRecords,
    });
  } catch (error) {
    console.error('[OAI-PMH] Error crítico durante la sincronización:', error);
    return NextResponse.json(
      { error: 'Error durante la sincronización OAI-PMH', details: (error as Error).message },
      { status: 500 }
    );
  }
}
