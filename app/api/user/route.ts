import { UserService } from '@/database/services';
import { errorMessage } from '@/modules/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const user_id = req.headers.get('X-User-ID');
  if (!user_id)
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized' },
      { status: 401 },
    );
  const result = await UserService.get(user_id);
  return NextResponse.json({ status: 'success', result }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  try {
    const user_id = req.headers.get('X-User-ID');
    if (!user_id)
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    const data = await req.json();
    const result = await UserService.update(user_id, data);
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user_id = req.headers.get('X-User-ID');
    if (!user_id)
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    const result = await UserService.delete(user_id);
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}
