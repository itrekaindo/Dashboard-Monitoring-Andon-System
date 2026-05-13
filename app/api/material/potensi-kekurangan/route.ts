import { NextRequest, NextResponse } from 'next/server';
import {
  getPotensiKekuranganMaterial,
  getProductKekuranganMaterialChart,
  type PotensiKekuranganMaterialRow,
  type KekuranganMaterialChartRow,
} from '@/lib/queries/stok_material';

export async function GET(request: NextRequest) {
  try {
    const [data, chartData]: [PotensiKekuranganMaterialRow[], KekuranganMaterialChartRow[]] = await Promise.all([
      getPotensiKekuranganMaterial(),
      getProductKekuranganMaterialChart(),
    ]);
    
    return NextResponse.json(
      {
        success: true,
        data: data,
        chartData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error - gagal mengambil data potensi kekurangan material:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data potensi kekurangan material',
      },
      { status: 500 }
    );
  }
}
