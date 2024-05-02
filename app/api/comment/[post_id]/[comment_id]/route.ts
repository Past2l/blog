import {
  CommentService,
  HistoryService,
  PostService,
  UserService,
} from '@/database/services';
import { errorMessage, getIP, getOSfromUserAgent } from '@/modules/server';
import { isUUID } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { post_id: number; comment_id: string } },
) {
  try {
    if (isNaN(params.post_id))
      return NextResponse.json(
        { status: 'error', message: 'Post ID is not a number.' },
        { status: 400 },
      );
    const post = await PostService.find({ id: params.post_id });
    if (post.length < 1)
      return NextResponse.json(
        { status: 'error', message: 'Post does not exist.' },
        { status: 400 },
      );
    if (!isUUID(params.comment_id))
      return NextResponse.json(
        { status: 'error', message: 'Comment ID is not a UUID.' },
        { status: 400 },
      );
    const comment = await CommentService.get(params.comment_id);
    if (!comment || (await CommentService.checkDeleted(params.comment_id)))
      return NextResponse.json(
        { status: 'error', message: 'Comment does not exist.' },
        { status: 400 },
      );
    return NextResponse.json(
      { status: 'success', result: comment },
      { status: 200 },
    );
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { post_id: number; comment_id: string } },
) {
  try {
    const device_id = req.headers.get('X-Device-ID');
    if (!device_id)
      return NextResponse.json(
        { status: 'error', message: 'Device ID is required.' },
        { status: 400 },
      );
    if (isNaN(params.post_id))
      return NextResponse.json(
        { status: 'error', message: 'Post ID is not a number.' },
        { status: 400 },
      );
    const post = await PostService.find({ id: params.post_id });
    if (post.length < 1 || (await PostService.checkDeleted(params.post_id)))
      return NextResponse.json(
        { status: 'error', message: 'Post does not exist.' },
        { status: 400 },
      );
    if (!isUUID(params.comment_id))
      return NextResponse.json(
        { status: 'error', message: 'Comment ID is not a UUID.' },
        { status: 400 },
      );
    const comment = await CommentService.get(params.comment_id);
    if (!comment || (await CommentService.checkDeleted(params.comment_id)))
      return NextResponse.json(
        { status: 'error', message: 'Comment does not exist.' },
        { status: 400 },
      );
    const user_id = req.headers.get('X-User-ID') || '';
    const user = await UserService.get(user_id);
    if (!user || comment.user.id != user.id)
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    const result = await CommentService.update(
      params.comment_id,
      await req.json(),
    );
    await HistoryService.create({
      device_id,
      user_id,
      post_id: +params.post_id,
      comment_id: params.comment_id,
      ip: getIP(req),
      os: getOSfromUserAgent(req),
      action: 'EDIT_COMMENT',
    });
    return NextResponse.json({ status: 'success', result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { post_id: number; comment_id: string } },
) {
  try {
    const device_id = req.headers.get('X-Device-ID');
    if (!device_id)
      return NextResponse.json(
        { status: 'error', message: 'Device ID is required.' },
        { status: 400 },
      );
    if (isNaN(params.post_id))
      return NextResponse.json(
        { status: 'error', message: 'Post ID is not a number.' },
        { status: 400 },
      );
    const post = await PostService.find({ id: params.post_id });
    if (post.length < 1 || (await PostService.checkDeleted(params.post_id)))
      return NextResponse.json(
        { status: 'error', message: 'Post does not exist.' },
        { status: 400 },
      );
    if (!isUUID(params.comment_id))
      return NextResponse.json(
        { status: 'error', message: 'Comment ID is not a UUID.' },
        { status: 400 },
      );
    const comment = await CommentService.get(params.comment_id);
    if (!comment || (await CommentService.checkDeleted(params.comment_id)))
      return NextResponse.json(
        { status: 'error', message: 'Comment does not exist.' },
        { status: 400 },
      );
    const user_id = req.headers.get('X-User-ID') || '';
    const user = await UserService.get(user_id);
    if (!user || (comment.user.id != user.id && !user.owner))
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      );
    await HistoryService.create({
      device_id,
      user_id,
      post_id: +params.post_id,
      comment_id: params.comment_id,
      ip: getIP(req),
      os: getOSfromUserAgent(req),
      action: 'REMOVE_COMMENT',
    });
    await CommentService.delete(params.comment_id);
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(errorMessage(e), { status: 500 });
  }
}
