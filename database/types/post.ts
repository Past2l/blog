import { z } from 'zod';
import { post, postContent, tag } from '../schema';
import { db } from '..';
import { eq } from 'drizzle-orm';

export type PostContent = typeof postContent.$inferSelect;
export const PostContentValidate = z.object({
  index: z.number(),
  type: z.enum(postContent.type.enumValues),
  content: z.string(),
});
export type PostContentDto = z.infer<typeof PostContentValidate>;

export type Post = typeof post.$inferSelect;
export const PostValidate = z.object({
  title: z.string(),
  desc: z.string(),
  content: z.array(PostContentValidate),
  tag: z.array(
    z
      .string()
      .refine(
        async (v) => await db.query.tag.findFirst({ where: eq(tag.name, v) }),
        { message: 'Tag is not exist.' },
      ),
  ),
});
export type PostDto = z.infer<typeof PostValidate>;
