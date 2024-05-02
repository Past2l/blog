import { z } from 'zod';
import { comment, history, post, user } from '../schema';
import { db } from '..';
import { eq } from 'drizzle-orm';

export type History = typeof history.$inferSelect;
export const HistoryValidate = z.object({
  ip: z.string().ip(),
  device_id: z.string().uuid(),
  os: z.enum(history.os.enumValues),
  user_id: z
    .string()
    .optional()
    .nullable()
    .refine(
      async (v) =>
        !v || (await db.query.user.findFirst({ where: eq(user.id, v) })),
      { message: 'User is not exist.' },
    ),
  post_id: z
    .number()
    .refine(
      async (v) => await db.query.post.findFirst({ where: eq(post.id, v) }),
      { message: 'Post is not exist.' },
    ),
  comment_id: z
    .string()
    .optional()
    .nullable()
    .refine(
      async (v) =>
        !v || (await db.query.comment.findFirst({ where: eq(comment.id, v) })),
      { message: 'Comment is not exist.' },
    ),
  action: z.enum(history.action.enumValues),
});
export type HistoryDto = z.infer<typeof HistoryValidate>;
