import { Google, errorMessage } from '@/modules/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const token = (await req.json()).token || req.cookies.get('token')?.value;
    const result = await Google.refreshToken(token);
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}
