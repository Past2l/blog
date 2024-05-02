import { z } from 'zod';
import { tag } from '../schema';
import { eq } from 'drizzle-orm';
import { db } from '..';

export type Tag = typeof tag.$inferSelect;
export const TagValidate = z.object({
  name: z
    .string()
    .refine(
      async (v) => !(await db.query.tag.findFirst({ where: eq(tag.name, v) })),
      { message: 'Tag name is already exist.' },
    ),
  color_text_light: z.string().regex(/^#[0-9A-F]{6}[0-9a-f]{0,2}$/i),
  color_text_dark: z.string().regex(/^#[0-9A-F]{6}[0-9a-f]{0,2}$/i),
  color_bg_light: z.string().regex(/^#[0-9A-F]{6}[0-9a-f]{0,2}$/i),
  color_bg_dark: z.string().regex(/^#[0-9A-F]{6}[0-9a-f]{0,2}$/i),
});
export type TagDto = z.infer<typeof TagValidate>;
