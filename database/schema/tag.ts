import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { postToTag } from './post';

export const tag = pgTable('tag', {
  name: text('name').primaryKey(),
  color_text_light: text('color_text_light').notNull(),
  color_text_dark: text('color_text_dark').notNull(),
  color_bg_light: text('color_bg_light').notNull(),
  color_bg_dark: text('color_bg_dark').notNull(),
});

export const tagRelations = relations(tag, ({ many }) => ({
  postToTag: many(postToTag),
}));
