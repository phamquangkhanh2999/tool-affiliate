import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
  platform: z.array(z.string()).optional(),
});

// PATCH /api/campaigns/[id] — Update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message);

    const campaign = await prisma.campaign.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(campaign);
  } catch (err) {
    console.error("[PATCH /api/campaigns/id]", err);
    return errorResponse("Lỗi khi cập nhật campaign", 500);
  }
}

// DELETE /api/campaigns/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.campaign.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[DELETE /api/campaigns/id]", err);
    return errorResponse("Lỗi khi xóa campaign", 500);
  }
}
