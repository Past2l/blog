import { UserService, PostService, HistoryService } from '@/database/services';
import { errorMessage, getIP, getOSfromUserAgent } from '@/modules/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query = Object.fromEntries(
      req.nextUrl.searchParams.entries(),
    ) as object;
    const result = await PostService.find({ ...query, deleted: false }, query);
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const device_id = req.headers.get('X-Device-ID');
    if (!device_id)
      return NextResponse.json(
        { status: 'error', message: 'Device ID is required.' },
        { status: 400 },
      );
    const user_id = req.headers.get('X-User-ID');
    const user = await UserService.get(user_id || '');
    if (!user_id || !user?.owner)
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    const result = await PostService.create(await req.json(), user_id);
    await HistoryService.create({
      device_id,
      user_id,
      post_id: result!.id,
      ip: getIP(req),
      os: getOSfromUserAgent(req),
      action: 'ADD_POST',
    });
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}
