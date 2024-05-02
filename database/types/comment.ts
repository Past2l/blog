import { z } from 'zod';
import { comment, post, user } from '../schema';
import { db } from '..';
import { eq } from 'drizzle-orm';

export type Comment = typeof comment.$inferSelect;
export const CommentValidate = z.object({
  content: z.string(),
  post_id: z
    .number()
    .refine(
      async (v) => await db.query.post.findFirst({ where: eq(post.id, v) }),
      { message: 'Post is not exist.' },
    ),
  user_id: z
    .string()
    .refine(
      async (v) =>
        !v || (await db.query.user.findFirst({ where: eq(user.id, v) })),
      { message: 'User is not exist.' },
    ),
});
export type CommentDto = z.infer<typeof CommentValidate>;
