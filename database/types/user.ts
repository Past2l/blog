import { z } from 'zod';
import { user } from '../schema';
import { db } from '..';
import { eq } from 'drizzle-orm';

export type User = typeof user.$inferSelect;
export const UserValidate = z.object({
  id: z
    .string()
    .refine(
      async (v) => !(await db.query.user.findFirst({ where: eq(user.id, v) })),
      { message: 'User ID is already exist.' },
    ),
  name: z.string().min(3).max(16),
  email: z
    .string()
    .email()
    .refine(
      async (v) =>
        !(await db.query.user.findFirst({ where: eq(user.email, v) })),
      { message: 'Email is already exist.' },
    ),
  owner: z.boolean().optional().default(false),
  picture: z.string().url(),
});
export type UserDto = z.infer<typeof UserValidate>;
