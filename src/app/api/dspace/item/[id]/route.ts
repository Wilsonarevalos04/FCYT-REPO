import { NextRequest, NextResponse } from 'next/server';
import { getPublicationById } from '@/services/dspaceService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = getPublicationById(id);

    if (!item) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al recuperar publicación', details: (error as Error).message },
      { status: 500 }
    );
  }
}
