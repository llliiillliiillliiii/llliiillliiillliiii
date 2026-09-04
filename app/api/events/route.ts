import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/storage';

export async function GET() {
  const data = await getEvents();
  return NextResponse.json(data);
}
