import { TagService, UserService } from '@/database/services';
import { errorMessage } from '@/modules/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } },
) {
  const result = await TagService.get(params.name);
  if (!result)
    return NextResponse.json(
      { status: 'error', message: 'Tag does not exist.' },
      { status: 400 },
    );
  return NextResponse.json({ status: 'success', result }, { status: 200 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { name: string } },
) {
  try {
    const user_id = req.headers.get('X-User-ID') || '';
    const user = await UserService.get(user_id);
    if (!user_id || !user?.owner)
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    if (!(await TagService.get(params.name)))
      return NextResponse.json(
        { status: 'error', message: 'Tag does not exist.' },
        { status: 400 },
      );
    const result = await TagService.update(params.name, await req.json());
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { name: string } },
) {
  try {
    const user_id = req.headers.get('X-User-ID') || '';
    const user = await UserService.get(user_id);
    if (!user_id || !user?.owner)
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    if (!(await TagService.get(params.name)))
      return NextResponse.json(
        { status: 'error', message: 'Tag does not exist.' },
        { status: 400 },
      );
    await TagService.delete(params.name);
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}
