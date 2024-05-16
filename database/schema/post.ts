import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { tag } from './tag';
import { comment } from './comment';
import { user } from '.';

export const post = pgTable('post', {
  id: serial('id').primaryKey(),
  user_id: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  desc: text('desc').notNull(),
  deleted: boolean('deleted').default(false).notNull(),
  created: timestamp('created').notNull(),
  updated: timestamp('updated').notNull(),
});

export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, {
    fields: [post.user_id],
    references: [user.id],
  }),
  content: many(postContent),
  comment: many(comment),
  postToTag: many(postToTag),
}));

export const postContentTypeEnum = pgEnum('content_type', [
  'text',
  'image',
  'video',
  'file',
  'html',
]);

export const postContent = pgTable('post_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  post_id: integer('post_id')
    .references(() => post.id, { onDelete: 'cascade' })
    .notNull(),
  index: integer('index').notNull(),
  type: postContentTypeEnum('type').notNull(),
  content: text('content').notNull(),
});

export const postContentRelations = relations(postContent, ({ one }) => ({
  post: one(post, {
    fields: [postContent.post_id],
    references: [post.id],
  }),
}));

export const postToTag = pgTable(
  'post_tag',
  {
    post_id: integer('post_id')
      .references(() => post.id, { onDelete: 'cascade' })
      .notNull(),
    tag_name: text('tag_name')
      .references(() => tag.name, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey(t.post_id, t.tag_name),
  }),
);

export const postToTagRelations = relations(postToTag, ({ one }) => ({
  post: one(post, {
    fields: [postToTag.post_id],
    references: [post.id],
    relationName: 'post',
  }),
  tag: one(tag, {
    fields: [postToTag.tag_name],
    references: [tag.name],
    relationName: 'tag',
  }),
}));
