import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
};

export function successResponse<T>(
  data: T,
  meta?: ApiResponse["meta"],
  status = 200
) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data, meta },
    { status }
  );
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json<ApiResponse>(
    { success: false, error },
    { status }
  );
}

export function paginationMeta(total: number, page: number, limit: number) {
  return { total, page, limit, pages: Math.ceil(total / limit) };
}
