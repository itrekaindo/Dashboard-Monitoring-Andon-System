import { NextRequest, NextResponse } from 'next/server';
import { getProductCardbyTrainset, getProductCardbyTrainsetL2 } from '@/lib/queries/production-progress';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const trainset = searchParams.get('trainset');
    const line = searchParams.get('line') || 'Lantai 3';

    if (!trainset) {
      return NextResponse.json(
        { success: false, error: 'Trainset parameter is required' },
        { status: 400 }
      );
    }

    const trainsetNumber = Number(trainset);
    if (Number.isNaN(trainsetNumber)) {
      return NextResponse.json(
        { success: false, error: 'Trainset must be a valid number' },
        { status: 400 }
      );
    }

    let data;
    if (line === 'Lantai 2') {
      data = await getProductCardbyTrainsetL2(trainsetNumber);
    } else {
      data = await getProductCardbyTrainset(trainsetNumber);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching product cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product cards' },
      { status: 500 }
    );
  }
}
