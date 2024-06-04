import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  timestamp,
  integer,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { comment, historyAction, OSEnum, post, user } from '.';

export const history = pgTable('history', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: timestamp('date').notNull(),
  ip: text('ip').notNull(),
  device_id: uuid('device_id').notNull(),
  os: OSEnum('os').notNull(),
  user_id: text('user_id').references(() => user.id),
  post_id: integer('post_id')
    .references(() => post.id)
    .notNull(),
  comment_id: uuid('comment_id').references(() => comment.id),
  action: historyAction('action').notNull(),
  todayFirstSeen: boolean('todayFirstSeen'),
});

export const historyRelations = relations(history, ({ one }) => ({
  user: one(user, {
    fields: [history.user_id],
    references: [user.id],
  }),
  post: one(post, {
    fields: [history.post_id],
    references: [post.id],
  }),
  comment: one(comment, {
    fields: [history.comment_id],
    references: [comment.id],
  }),
}));
