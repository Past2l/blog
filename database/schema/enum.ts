import { pgEnum } from "drizzle-orm/pg-core";

export const OSEnum = pgEnum('os_list', [
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

export const postContentTypeEnum = pgEnum('content_type', [
  'text',
  'image',
  'video',
  'file',
  'html',
]);