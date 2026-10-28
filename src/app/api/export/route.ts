import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getAllRepositoryRecords } from '@/services/repositoryDb';
import { filterRecords } from '@/services/analyticsEngine';
import { GlobalFilters } from '@/types/oai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters: GlobalFilters = body.filters || {};
    const format: 'csv' | 'excel' | 'json' = body.format || 'excel';

    const allRecords = getAllRepositoryRecords();
    const filtered = filterRecords(allRecords, filters);

    // Preparar filas para exportación
    const rows = filtered.map((r, index) => ({
      Nro: index + 1,
      Identificador_OAI: r.identifier,
      Handle: r.handle,
      Titulo: r.title,
      Autores: r.authors.join('; '),
      Tutores_Asesores: r.advisors.join('; '),
      Anio: r.year || '',
      Fecha_Publicacion: r.dateIssued,
      Tipo_Documento: r.docType,
      Carrera_Unidad: r.career,
      Coleccion: r.collection,
      Comunidad: r.community,
      Linea_Investigacion: r.researchLine || 'No especificada',
      ODS: r.ods.join('; '),
      Palabras_Clave: r.subjects.join('; '),
      Idioma: r.language,
      Enlace_DSpace: r.uri,
      Enlace_PDF: r.pdfUrl || 'No disponible',
      Calidad_Metadatos_Porcentaje: `${r.quality.completenessScore}%`,
      Campos_Faltantes: r.quality.missingFields.join(', ') || 'Ninguno',
      Resumen: r.abstract,
    }));

    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
      return NextResponse.json(filtered, {
        headers: {
          'Content-Disposition': `attachment; filename="fcyt_export_${dateStr}.json"`,
        },
      });
    }

    // Crear libro con SheetJS / XLSX
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: 'Reporte de Publicaciones FCyT - UNCA',
      Subject: 'Repositorio DSpace FCyT UNCA (OAI-PMH)',
      Author: 'Wilson Javier Arévalos Peralta & Jorge Ronaldo Areco Falcón',
      Company: 'Facultad de Ciencias y Tecnologías - UNCA',
      CreatedDate: new Date(),
    };
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Publicaciones FCyT');

    if (format === 'csv') {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      // Agregar BOM UTF-8 para compatibilidad perfecta con Excel en español
      const csvWithBom = '\uFEFF' + csvOutput;
      return new NextResponse(csvWithBom, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="fcyt_publicaciones_${dateStr}.csv"`,
        },
      });
    }

    // Formato Excel .xlsx
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="fcyt_publicaciones_${dateStr}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error en /api/export:', error);
    return NextResponse.json(
      { error: 'Error al exportar registros', details: (error as Error).message },
      { status: 500 }
    );
  }
}
