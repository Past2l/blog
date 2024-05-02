import { and, asc, between, desc, eq } from 'drizzle-orm';
import { db } from '..';
import {
  FindOptionDto,
  FindOptionValidate,
  HistoryDto,
  HistoryValidate,
} from '../types';
import { History } from '../types';
import { history } from '../schema';

export class HistoryService {
  static async find(data: Partial<History>, option?: Partial<FindOptionDto>) {
    const { sort, page, count, from, to } = FindOptionValidate.parse(option);
    const { id, ip, device_id, user_id, post_id, os } = data;
    return await db.query.history.findMany({
      where: and(
        id ? eq(history.id, id) : undefined,
        ip ? eq(history.ip, ip) : undefined,
        os ? eq(history.os, os) : undefined,
        device_id ? eq(history.device_id, device_id) : undefined,
        user_id ? eq(history.user_id, user_id) : undefined,
        post_id ? eq(history.post_id, post_id) : undefined,
        between(history.date, from, to),
      ),
      orderBy: sort == 'asc' ? [asc(history.date)] : [desc(history.date)],
      offset: (page - 1) * count,
      limit: count,
      columns: { user_id: false, post_id: false },
      with: { user: { columns: { owner: false } }, post: true },
    });
  }

  static async get(id: string) {
    return await db.query.history.findFirst({
      where: eq(history.id, id),
      columns: { user_id: false, post_id: false },
      with: { user: { columns: { owner: false } }, post: true },
    });
  }

  static async create(data: HistoryDto) {
    const from = new Date();
    const to = new Date();
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    await db.insert(history).values({
      ...(await HistoryValidate.parseAsync(data)),
      todayFirstSeen:
        data.action == 'VIEW_POST'
          ? !(await db.query.history.findFirst({
              where: and(
                between(history.date, from, to),
                eq(history.post_id, data.post_id),
                eq(history.action, 'VIEW_POST'),
              ),
            }))
          : null,
    });
  }

  static async update(id: string, data: Partial<History>) {
    await db.update(history).set(data).where(eq(history.id, id));
    return this.get(id);
  }

  static async delete(id: string) {
    await db.delete(history).where(eq(history.id, id));
  }
}
