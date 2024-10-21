import { NextRequest, NextResponse } from 'next/server';
import { initSocketServer } from '../../../server/socketServer';

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  initSocketServer(res as any);
  return NextResponse.json({ message: 'Socket server initialized' });
}

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  initSocketServer(res as any);
  return NextResponse.json({ message: 'Socket server initialized' });
}