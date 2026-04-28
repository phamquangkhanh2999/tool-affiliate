import { NextResponse } from 'next/server';
import { fetchShopeeProducts } from '@/lib/shopee';
import { cache } from '@/lib/cache';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword') || '';
    const sortBy = (searchParams.get('sortBy') as any) || 'commission';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Dùng cache để lưu lại kết quả search trong 5 phút
    const cacheKey = `shopee-search:${keyword}:${sortBy}:${page}:${limit}`;
    
    const products = await cache.fetchOrCache(
      cacheKey,
      () => fetchShopeeProducts({ keyword, sortBy, page, limit }),
      300 // 5 mins
    );

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('Shopee Search API Error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tìm kiếm sản phẩm' }, { status: 500 });
  }
}
