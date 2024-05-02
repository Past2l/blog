import { UserService, PostService, HistoryService } from '@/database/services';
import { errorMessage, getIP, getOSfromUserAgent } from '@/modules/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: number } },
) {
  const device_id = req.headers.get('X-Device-ID');
  if (!device_id)
    return NextResponse.json(
      { status: 'error', message: 'Device ID is required.' },
      { status: 400 },
    );
  const result = await PostService.get(params.id);
  const user_id = req.headers.get('X-User-ID');
  if (!result || (await PostService.checkDeleted(params.id)))
    return NextResponse.json(
      { status: 'error', message: 'Post does not exist.' },
      { status: 400 },
    );
  await HistoryService.create({
    device_id,
    user_id,
    post_id: result!.id,
    ip: getIP(req),
    os: getOSfromUserAgent(req),
    action: 'VIEW_POST',
  });
  return NextResponse.json({ status: 'success', result }, { status: 200 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: number } },
) {
  try {
    const device_id = req.headers.get('X-Device-ID');
    if (!device_id)
      return NextResponse.json(
        { status: 'error', message: 'Device ID is required.' },
        { status: 400 },
      );
    if (
      !(await PostService.get(params.id)) ||
      (await PostService.checkDeleted(params.id))
    )
      return NextResponse.json(
        { status: 'error', message: 'Post does not exist.' },
        { status: 400 },
      );
    const user_id = req.headers.get('X-User-ID');
    const user = await UserService.get(user_id || '');
    if (!user_id || !user?.owner)
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    const result = await PostService.update(params.id, await req.json());
    await HistoryService.create({
      device_id,
      user_id,
      post_id: result!.id,
      ip: getIP(req),
      os: getOSfromUserAgent(req),
      action: 'EDIT_POST',
    });
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: number } },
) {
  try {
    const device_id = req.headers.get('X-Device-ID');
    if (!device_id)
      return NextResponse.json(
        { status: 'error', message: 'Device ID is required.' },
        { status: 400 },
      );
    if (
      !(await PostService.get(params.id)) ||
      (await PostService.checkDeleted(params.id))
    )
      return NextResponse.json(
        { status: 'error', message: 'Post does not exist.' },
        { status: 400 },
      );
    const user_id = req.headers.get('X-User-ID') || '';
    const user = await UserService.get(user_id);
    if (!user_id || !user?.owner)
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    await PostService.delete(params.id);
    await HistoryService.create({
      device_id,
      user_id,
      post_id: +params.id,
      ip: getIP(req),
      os: getOSfromUserAgent(req),
      action: 'REMOVE_POST',
    });
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}
