import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return errorResponse('Thiếu URL sản phẩm', 400);

    console.log('[SCRAPER] Processing:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return errorResponse(`Sàn TMĐT đã chặn yêu cầu (${response.status}). Vui lòng dán nội dung thủ công hoặc dùng link khác.`, response.status);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extraction Strategy 1: OpenGraph (Standard)
    let title = $('meta[property="og:title"]').attr('content') || $('title').text();
    let description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
    let image = $('meta[property="og:image"]').attr('content');
    
    // Extraction Strategy 2: Schema.org (Product Data)
    let price = "";
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '{}');
        const searchProduct = (obj: any): any => {
            if (obj?.['@type'] === 'Product') return obj;
            if (obj?.['@graph']) return obj['@graph'].find((i: any) => i['@type'] === 'Product');
            if (Array.isArray(obj)) return obj.find((i: any) => i['@type'] === 'Product');
            return null;
        };
        const product = searchProduct(json);
        if (product) {
            if (!title || title.length < 5) title = product.name;
            if (!description || description.length < 10) description = product.description;
            if (!image) image = product.image;
            price = product.offers?.price || product.offers?.[0]?.price || "";
        }
      } catch (e) {}
    });

    // Strategy 3: Shopee Specific Shell Data (if any)
    if (!title || title.length < 10) {
        // Try to find Shopee product name in the raw HTML if it's there but not in meta
        const match = html.match(/"name":"([^"]+)"/);
        if (match && match[1]) title = match[1];
    }

    // Cleaning
    title = title?.replace(/\| Shopee Việt Nam/g, '')?.trim();
    if (price && !isNaN(Number(price))) {
        price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
    }

    if (!title || title.length < 2) {
       return errorResponse('Không thể tự động lấy dữ liệu từ link này (Bảo mật cao). Bạn hãy dán link vào và tự điền tên nhé!', 422);
    }

    return successResponse({
      name: title,
      description: description || "",
      price: price || "Xem tại link",
      imageUrl: image || "",
      originalUrl: url
    });

  } catch (err: any) {
    console.error('[SCRAPER ERROR]', err);
    return errorResponse(`Lỗi kỹ thuật: ${err.message}`, 500);
  }
}
