import { NextRequest, NextResponse } from 'next/server';
import { getProductDetailByProductL3 } from '@/lib/queries/production-progress';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const trainset = searchParams.get('trainset');
    const idProduct = searchParams.get('id_product');
    const productName = searchParams.get('product_name') || undefined;

    if (!trainset) {
      return NextResponse.json(
        { success: false, error: 'Trainset parameter is required' },
        { status: 400 }
      );
    }

    if (!idProduct) {
      return NextResponse.json(
        { success: false, error: 'id_product parameter is required' },
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

    const data = await getProductDetailByProductL3(trainsetNumber, idProduct, productName);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product detail' },
      { status: 500 }
    );
  }
}