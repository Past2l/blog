import { Google } from '@/modules/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.redirect(Google.getLoginURL(req));
}
