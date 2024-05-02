import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  timestamp,
  integer,
  text,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { comment, post, user } from '.';

export const historyOSEnum = pgEnum('history_os', [
  'Android',
  'iOS',
  'iPadOS',
  'macOS',
  'Windows',
  'Linux',
  'Other',
]);

export const historyAction = pgEnum('history_action', [
  'ADD_POST',
  'VIEW_POST',
  'EDIT_POST',
  'REMOVE_POST',
  'ADD_COMMENT',
  'EDIT_COMMENT',
  'REMOVE_COMMENT',
]);

export const history = pgTable('history', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: timestamp('date').defaultNow().notNull(),
  ip: text('ip').notNull(),
  device_id: uuid('device_id').notNull(),
  os: historyOSEnum('os').notNull(),
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
