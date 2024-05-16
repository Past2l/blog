import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { user } from './user';
import { post } from './post';

export const comment = pgTable('comment', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  post_id: integer('post_id')
    .references(() => post.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  deleted: boolean('deleted').default(false).notNull(),
  created: timestamp('created').notNull(),
  updated: timestamp('updated').notNull(),
});

export const commentRelations = relations(comment, ({ one }) => ({
  user: one(user, {
    fields: [comment.user_id],
    references: [user.id],
  }),
  post: one(post, {
    fields: [comment.post_id],
    references: [post.id],
  }),
}));
