import { NextRequest, NextResponse } from 'next/server';

/**
 * API Chuyển đổi Link Sản phẩm thành Link Affiliate cá nhân
 */
export async function POST(req: NextRequest) {
  try {
    const { url, affiliateId, platform = 'shopee' } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: 'Thiếu URL sản phẩm' }, { status: 400 });
    }

    if (!affiliateId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã Affiliate ID' }, { status: 400 });
    }

    let convertedUrl = url;
    const cleanUrl = url.split('?')[0]; // Lấy link gốc không có param cũ

    if (platform === 'shopee' || url.includes('shopee.vn')) {
      // Regex cho link Shopee: i.SHOPID.ITEMID hoặc product/SHOPID/ITEMID
      const match = cleanUrl.match(/i\.(\d+)\.(\d+)/) || cleanUrl.match(/product\/(\d+)\/(\d+)/);
      
      if (match) {
        const shopId = match[1];
        const itemId = match[2];
        // Cấu hình link Affiliate Shopee chuẩn (Universal Link)
        convertedUrl = `https://shopee.vn/product/${shopId}/${itemId}?utm_campaign=-&utm_content=-&utm_medium=affiliates&utm_source=an_17345670000&utm_term=${affiliateId}`;
      }
    } 
    else if (platform === 'lazada' || url.includes('lazada.vn')) {
      // Regex cho link Lazada: ...-i12345-s67890.html
      const match = cleanUrl.match(/-i(\d+)-s(\d+)\.html/) || cleanUrl.match(/-i(\d+)\.html/);
      if (match) {
        const itemId = match[1];
        // Link Lazada Affiliate Template
        convertedUrl = `https://c.lazada.vn/t/c.XjY?url=https://www.lazada.vn/products/i${itemId}.html&aff_id=${affiliateId}`;
      }
    }

    // Tích hợp rút gọn link (Optional: Ví dụ dùng TinyURL API không cần Key cho demo)
    try {
      const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(convertedUrl)}`);
      if (tinyRes.ok) {
        const shortUrl = await tinyRes.text();
        return NextResponse.json({ 
          success: true, 
          originalUrl: url,
          convertedUrl: convertedUrl,
          shortUrl: shortUrl 
        });
      }
    } catch (e) {
      console.error('TinyURL Error', e);
    }

    return NextResponse.json({ 
      success: true, 
      convertedUrl,
      shortUrl: convertedUrl // Fallback nếu rút gọn lỗi
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
