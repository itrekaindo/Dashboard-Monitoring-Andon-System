import { NextResponse } from 'next/server';
import { createLaporanDilintas } from '@/lib/queries/laporan_dilintas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      serial_number,
      product_name,
      nama_pelapor,
      instansi,
      whatsapp,
      jenis_laporan,
      keterangan
    } = body;

    // Validate required fields
    if (!nama_pelapor || !instansi || !whatsapp || !jenis_laporan || !keterangan) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Validate WhatsApp format (basic validation)
    if (!/^\d{10,15}$/.test(whatsapp.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Format nomor WhatsApp tidak valid' },
        { status: 400 }
      );
    }

    const result = await createLaporanDilintas({
      serial_number: serial_number || null,
      product_name: product_name || null,
      nama_pelapor,
      instansi,
      whatsapp,
      jenis_laporan,
      keterangan
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Laporan berhasil disimpan',
        id_laporan: result.id_laporan
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating laporan:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan laporan' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serial_number = searchParams.get('serial_number');

    if (!serial_number) {
      return NextResponse.json(
        { error: 'Serial number diperlukan' },
        { status: 400 }
      );
    }

    // For now, just return success - actual fetch can be implemented later
    return NextResponse.json(
      { success: true, data: [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil laporan' },
      { status: 500 }
    );
  }
}
