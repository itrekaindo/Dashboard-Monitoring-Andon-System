import { getProductPercentageLantai2 } from '@/lib/queries/production-progress-protrack';

export async function GET() {
  try {
    const data = await getProductPercentageLantai2();
    //console.log('[API] Product Percentage Lantai 2 data:', data);
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Failed to fetch product percentage data:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
