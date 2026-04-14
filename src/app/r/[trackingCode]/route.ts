import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /r/[trackingCode] — Click tracking redirect
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingCode: string }> }
) {
  const { trackingCode } = await params;

  try {
    const link = await prisma.affiliateLink.findUnique({
      where: { trackingCode },
    });

    if (!link) {
      return NextResponse.json({ error: "Link không tồn tại" }, { status: 404 });
    }

    // Log click event
    await Promise.all([
      prisma.clickEvent.create({
        data: {
          affiliateLinkId: link.id,
          ipAddress: req.headers.get("x-forwarded-for") || undefined,
          userAgent: req.headers.get("user-agent") || undefined,
          referer: req.headers.get("referer") || undefined,
        },
      }),
      prisma.affiliateLink.update({
        where: { id: link.id },
        data: { clicks: { increment: 1 } },
      }),
    ]);

    // Redirect to original URL
    return NextResponse.redirect(link.shortUrl || link.originalUrl, { status: 302 });
  } catch (err) {
    console.error("[GET /r/trackingCode]", err);
    return NextResponse.redirect("https://shopee.vn", { status: 302 });
  }
}
