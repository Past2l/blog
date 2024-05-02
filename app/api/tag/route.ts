import { TagService, UserService } from '@/database/services';
import { errorMessage } from '@/modules/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query = Object.fromEntries(
      req.nextUrl.searchParams.entries(),
    ) as object;
    const result = await TagService.find(query, query);
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user_id = req.headers.get('X-User-ID') || '';
    const user = await UserService.get(user_id);
    if (!user_id || !user?.owner)
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    const result = await TagService.create(await req.json());
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}
