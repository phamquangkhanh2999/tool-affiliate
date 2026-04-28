import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateBody, CreateLinkSchema } from '@/lib/validators';
import { generateAffiliateUrl } from '@/lib/shopee';

export async function POST(req: Request) {
  try {
    const data = await validateBody(req, CreateLinkSchema);
    
    // Generate unique tracking code
    let trackingCode = data.customCode;
    
    if (trackingCode) {
      // Check if custom code exists
      const existing = await prisma.affiliateLink.findUnique({
        where: { trackingCode }
      });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Custom code đã tồn tại. Vui lòng chọn code khác.' }, { status: 400 });
      }
    } else {
      // Generate random 6-char code
      trackingCode = Math.random().toString(36).substring(2, 8);
      // Ensure unique
      let exists = true;
      while(exists) {
        const check = await prisma.affiliateLink.findUnique({ where: { trackingCode } });
        if (!check) exists = false;
        else trackingCode = Math.random().toString(36).substring(2, 8);
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shortUrl = `${appUrl}/r/${trackingCode}`;
    
    // Convert to affiliate URL if it's Shopee
    let finalOriginalUrl = data.originalUrl;
    if (data.platform === 'shopee') {
      finalOriginalUrl = generateAffiliateUrl(data.originalUrl, trackingCode);
    }

    // Default to a system user or handle auth here if NextAuth session is available
    // For now we'll find the first user as a fallback since auth isn't fully wired in this snippet
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Chưa có user trong hệ thống' }, { status: 400 });
    }

    // Since productId is required in schema but we might not have it when creating standalone links,
    // we should create a dummy product if it's not provided.
    let productId = data.productId;
    if (!productId) {
      const product = await prisma.product.create({
        data: {
          name: 'Custom Link Product',
          userId: user.id,
          originalPrice: 0,
        }
      });
      productId = product.id;
    }

    const newLink = await prisma.affiliateLink.create({
      data: {
        originalUrl: finalOriginalUrl,
        shortUrl,
        trackingCode,
        platform: data.platform,
        productId: productId,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newLink,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`
      }
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('Link Shortener Error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi server khi tạo link' }, { status: 500 });
  }
}
