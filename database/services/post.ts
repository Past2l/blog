import { and, asc, between, desc, eq, like } from 'drizzle-orm';
import { db } from '..';
import {
  FindOptionDto,
  FindOptionValidate,
  Post,
  PostDto,
  PostValidate,
} from '../types';
import { comment, post, postContent, postToTag } from '../schema';

export class PostService {
  static async find(data: Partial<Post>, option: Partial<FindOptionDto> = {}) {
    const { sort, page, count, from, to } = FindOptionValidate.parse(option);
    const result = await db.query.post.findMany({
      where: and(
        like(post.title, `%${data.title || ''}%`),
        like(post.desc, `%${data.desc || ''}%`),
        between(post.created, from, to),
        eq(post.deleted, false),
      ),
      orderBy: sort == 'asc' ? [asc(post.created)] : [desc(post.created)],
      offset: (page - 1) * count,
      limit: count,
      columns: { user_id: false, deleted: false },
      with: {
        user: { columns: { owner: false } },
        postToTag: { columns: {}, with: { tag: true } },
      },
    });
    return result.map((x) => ({ ...x, tag: x.postToTag.map((y) => y.tag) }));
  }

  static async checkDeleted(id: number) {
    const data = await db.query.post.findFirst({ where: eq(post.id, id) });
    return data?.deleted || false;
  }

  static async get(id: number) {
    const result = await db.query.post.findFirst({
      where: eq(post.id, id),
      columns: { deleted: false },
      with: {
        user: { columns: { owner: false } },
        content: {
          orderBy: [asc(postContent.index)],
          columns: { post_id: false },
        },
        postToTag: { columns: {}, with: { tag: true } },
        comment: { where: eq(comment.deleted, false), columns: { deleted: false } },
      },
    });
    return (
      result && {
        ...result,
        tag: result.postToTag.map((x) => x.tag),
        postToTag: undefined,
      }
    );
  }

  static async create(data: PostDto, user_id: string) {
    const { title, desc, content, tag } = await PostValidate.parseAsync(data);
    const id = (
      await db
        .insert(post)
        .values({ user_id, title, desc })
        .returning({ id: post.id })
    )[0].id;
    for (let i = 0; i < content.length; i++)
      await db.insert(postContent).values({ post_id: id, ...content[i] });
    for (const x of tag)
      await db.insert(postToTag).values({ post_id: id, tag_name: x });
    return this.get(id);
  }

  static async update(id: number, data: Partial<Post>) {
    const { title, desc, content, tag } =
      await PostValidate.partial().parseAsync(data);
    if (content) {
      const prevContent = await db.query.postContent.findMany({
        where: eq(postContent.post_id, id),
      });
      for (const x of prevContent)
        await db
          .delete(postContent)
          .where(and(eq(postContent.post_id, id), eq(postContent.id, x.id)));
      for (let i = 0; i < content.length; i++)
        await db.insert(postContent).values({ post_id: id, ...content[i] });
    }
    if (tag) {
      const prevTag = await db.query.postToTag.findMany({
        where: eq(postToTag.post_id, id),
      });
      for (const x of prevTag)
        if (!tag.includes(x.tag_name))
          await db
            .delete(postToTag)
            .where(
              and(
                eq(postToTag.post_id, id),
                eq(postToTag.tag_name, x.tag_name),
              ),
            );
      for (const x of tag)
        if (!prevTag.map((x) => x.tag_name).includes(x))
          await db.insert(postToTag).values({ post_id: id, tag_name: x });
    }
    await db
      .update(post)
      .set({ title, desc, updated: new Date() })
      .where(eq(post.id, id));
    return this.get(id);
  }

  static async delete(id: number) {
    // await db.delete(post).where(eq(post.id, id));
    await db.update(post).set({ deleted: true }).where(eq(post.id, id));
  }
}
