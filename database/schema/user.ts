import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { comment, history, post } from '.';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  owner: boolean('owner').default(false).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  picture: text('picture').notNull(),
  created: timestamp('created').notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  post: many(post),
  comment: many(comment),
  history: many(history),
}));
