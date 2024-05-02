import { CommentService, HistoryService, PostService, UserService } from '@/database/services';
import { errorMessage, getIP, getOSfromUserAgent } from '@/modules/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { post_id: number } },
) {
  try {
    const query = Object.fromEntries(
      req.nextUrl.searchParams.entries(),
    ) as object;
    if (isNaN(params.post_id))
      return NextResponse.json(
        { status: 'error', message: 'Post ID is not a number.' },
        { status: 400 },
      );
    const post = await PostService.get(params.post_id);
    if (!post || (await PostService.checkDeleted(params.post_id)))
      return NextResponse.json(
        { status: 'error', message: 'Post does not exist.' },
        { status: 400 },
      );
    const result = await CommentService.find(
      { ...query, post_id: params.post_id },
      query,
    );
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { post_id: number } },
) {
  try {
    const device_id = req.headers.get('X-Device-ID');
    if (!device_id)
      return NextResponse.json(
        { status: 'error', message: 'Device ID is required.' },
        { status: 400 },
      );
    const user_id = req.headers.get('X-User-ID') || '';
    const user = await UserService.get(user_id);
    if (!user)
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    if (isNaN(params.post_id))
      return NextResponse.json(
        { status: 'error', message: 'Post ID is not a number.' },
        { status: 400 },
      );
    const post = await PostService.get(params.post_id);
    if (!post || (await PostService.checkDeleted(params.post_id)))
      return NextResponse.json(
        { status: 'error', message: 'Post does not exist.' },
        { status: 400 },
      );
    const result = await CommentService.create(
      await req.json(),
      +params.post_id,
      user_id,
    );
    await HistoryService.create({
      device_id,
      user_id,
      post_id: +params.post_id,
      comment_id: result!.id,
      ip: getIP(req),
      os: getOSfromUserAgent(req),
      action: 'ADD_COMMENT',
    });
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}
