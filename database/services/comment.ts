import { and, asc, between, desc, eq } from 'drizzle-orm';
import { comment } from '../schema';
import {
  CommentDto,
  CommentValidate,
  FindOptionDto,
  FindOptionValidate,
} from '../types';
import { Comment } from '../types';
import { db } from '..';

export class CommentService {
  static async find(
    data: Partial<Comment>,
    option?: Partial<FindOptionDto> & { post?: boolean },
  ) {
    const { id, post_id, user_id, content } = data;
    const { sort, page, count, from, to } = FindOptionValidate.parse(option);
    return await db.query.comment.findMany({
      where: and(
        id ? eq(comment.id, id) : undefined,
        user_id ? eq(comment.user_id, user_id) : undefined,
        post_id ? eq(comment.post_id, post_id) : undefined,
        content ? eq(comment.content, content) : undefined,
        between(comment.created, from, to),
        eq(comment.deleted, false),
      ),
      orderBy: sort == 'asc' ? [asc(comment.created)] : [desc(comment.created)],
      columns: { user_id: false, post_id: false, deleted: false },
      with: {
        user: true,
        post: option?.post
          ? { columns: { user_id: false, deleted: false } }
          : undefined,
      },
      offset: (page - 1) * count,
      limit: count,
    });
  }

  static async checkDeleted(id: string) {
    const data = await db.query.comment.findFirst({
      where: eq(comment.id, id),
    });
    return data?.deleted || false;
  }

  static async get(id: string) {
    return await db.query.comment.findFirst({
      where: eq(comment.id, id),
      columns: { user_id: false, post_id: false, deleted: false },
      with: {
        user: true,
        post: { columns: { user_id: false, deleted: false } },
      },
    });
  }

  static async create(data: CommentDto, post_id: number, user_id: string) {
    const id = (
      await db
        .insert(comment)
        .values({
          ...(await CommentValidate.parseAsync({ ...data, post_id, user_id })),
          created: new Date(),
          updated: new Date(),
        })
        .returning({ id: comment.id })
    )[0].id;
    return this.get(id);
  }

  static async update(id: string, data: Partial<Comment>) {
    await db
      .update(comment)
      .set(
        await CommentValidate.omit({ user_id: true, post_id: true })
          .partial()
          .parseAsync(data),
      )
      .where(eq(comment.id, id));
    return this.get(id);
  }

  static async delete(id: string) {
    // await db.delete(comment).where(eq(comment.id, id));
    await db.update(comment).set({ deleted: true }).where(eq(comment.id, id));
  }
}
