import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger';

export async function GET() {
  const docs = await getApiDocs();
  return NextResponse.json(docs);
}
