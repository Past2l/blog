import { eq, like } from 'drizzle-orm';
import { db } from '..';
import {
  FindOptionDto,
  FindOptionValidate,
  Tag,
  TagDto,
  TagValidate,
} from '../types';
import { tag } from '../schema';

export class TagService {
  static async find(data: Partial<Tag>, option?: Partial<FindOptionDto>) {
    const { name } = data;
    const { page, count } = FindOptionValidate.parse(option);
    return await db.query.tag.findMany({
      where: like(tag.name, `%${name || ''}%`),
      offset: (page - 1) * count,
      limit: count,
    });
  }

  static async get(name: string) {
    return await db.query.tag.findFirst({
      where: eq(tag.name, name),
    });
  }

  static async create(data: TagDto) {
    await db.insert(tag).values(await TagValidate.parseAsync(data));
    return this.get(data.name);
  }

  static async update(name: string, data: Partial<TagDto>) {
    await db
      .update(tag)
      .set(await TagValidate.omit({ name: true }).partial().parseAsync(data))
      .where(eq(tag.name, name));
    return this.get(name);
  }

  static async delete(name: string) {
    await db.delete(tag).where(eq(tag.name, name));
  }
}
