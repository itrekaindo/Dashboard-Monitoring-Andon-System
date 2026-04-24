import { NextResponse } from 'next/server';
import { getStokMaterialTimeline } from '@/lib/queries/stok_material';

type TimelineEvent = {
  type: 'reserved' | 'ready' | 'shipped';
  date: string | null;
  status: string;
  message: string;
  line: string;
  no_kpm: string | null;
  pic: string | null;
  pic_reservasi: string | null;
  no_reservasi: string | null;
  qty_ready: number | null;
};

function toEventDate(value: string | null): string | null {
  return value || null;
}

function buildTimelineEvents(rows: Array<{
  no_kpm: string | null;
  post_date: string | null;
  tgl_ready: string | null;
  out_date: string | null;
  pic: string | null;
  pic_reservasi: string | null;
  no_reservasi: string | null;
  qty_ready: number | null;
}>) {
  const events: TimelineEvent[] = [];
  const eventKeys = new Set<string>();

  const pushEvent = (event: TimelineEvent) => {
    const key = `${event.no_kpm || '-'}|${event.type}|${event.date || '-'}`;
    if (eventKeys.has(key)) return;
    eventKeys.add(key);
    events.push(event);
  };

  rows.forEach((row) => {
    if (row.post_date) {
      pushEvent({
        type: 'reserved',
        date: toEventDate(row.post_date),
        status: 'Material Direservasi',
        message: `Material direservasi oleh ${row.pic || 'Unknown'} dengan No. KPM ${row.no_kpm || '-'}`,
        line: 'Lantai 1',
        no_kpm: row.no_kpm,
        pic: row.pic,
        pic_reservasi: row.pic_reservasi,
        no_reservasi: row.no_reservasi,
        qty_ready: row.qty_ready,
      });
    }

    if (row.tgl_ready) {
      pushEvent({
        type: 'ready',
        date: toEventDate(row.tgl_ready),
        status: 'Material Disiapkan',
        message: `Material disiapkan oleh ${row.pic_reservasi || 'Unknown'} dengan no reservasi : ${row.no_reservasi || '-'}`,
        line: 'Lantai 1',
        no_kpm: row.no_kpm,
        pic: row.pic,
        pic_reservasi: row.pic_reservasi,
        no_reservasi: row.no_reservasi,
        qty_ready: row.qty_ready,
      });
    }

    if (row.out_date) {
      pushEvent({
        type: 'shipped',
        date: toEventDate(row.out_date),
        status: 'Material Dikirim',
        message: `Material dikirim oleh ${row.pic || 'Aris'} dengan No. KPM ${row.no_kpm || '-'}`,
        line: 'Lantai 1',
        no_kpm: row.no_kpm,
        pic: row.pic,
        pic_reservasi: row.pic_reservasi,
        no_reservasi: row.no_reservasi,
        qty_ready: row.qty_ready,
      });
    }
  });

  return events.sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;
    if (aTime !== bTime) return aTime - bTime;

    const order: Record<TimelineEvent['type'], number> = {
      reserved: 1,
      ready: 2,
      shipped: 3,
    };

    return order[a.type] - order[b.type];
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const no_kpm = searchParams.get('no_kpm');

    if (!no_kpm) {
      return NextResponse.json(
        { error: 'Missing required parameter: no_kpm' },
        { status: 400 }
      );
    }

    console.log(`🔍 API Request: no_kpm=${no_kpm}`);
    const rows = await getStokMaterialTimeline(no_kpm);
    const timeline = buildTimelineEvents(rows);
    console.log(`📤 API Response: ${timeline.length} records`);

    return NextResponse.json({
      timeline,
        debug: {
          params: { no_kpm },
          count: timeline.length,
        }
    });
  } catch (error) {
    console.error('Error fetching stok material timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stok material timeline' },
      { status: 500 }
    );
  }
}
