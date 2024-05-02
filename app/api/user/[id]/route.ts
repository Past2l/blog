import { UserService } from '@/database/services';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user_id = req.headers.get('X-User-ID');
  if (!user_id)
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized' },
      { status: 401 },
    );
  const user = await UserService.get(params.id);
  if (!user)
    return NextResponse.json(
      { status: 'error', message: 'User does not exist.' },
      { status: 400 },
    );
  const result = await UserService.get(params.id, user?.owner);
  return NextResponse.json({ status: 'success', result }, { status: 200 });
}
