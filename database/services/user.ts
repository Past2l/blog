import { and, asc, between, desc, eq } from 'drizzle-orm';
import { db } from '..';
import { user } from '../schema';
import {
  FindOptionDto,
  FindOptionValidate,
  User,
  UserDto,
  UserValidate,
} from '../types';

export class UserService {
  static async find(data: Partial<User>, option?: Partial<FindOptionDto>) {
    const { id, owner, name, email } = data;
    const { sort, page, count, from, to } = FindOptionValidate.parse(option);
    return await db.query.user.findMany({
      where: and(
        id ? eq(user.id, id) : undefined,
        owner ? eq(user.owner, owner) : undefined,
        name ? eq(user.name, name) : undefined,
        email ? eq(user.email, email) : undefined,
        between(user.created, from, to),
      ),
      orderBy: sort == 'asc' ? [asc(user.created)] : [desc(user.created)],
      columns: { owner: false },
      offset: (page - 1) * count,
      limit: count,
    });
  }

  static async get(id: string, history: boolean = false) {
    return await db.query.user.findFirst({
      where: eq(user.id, id),
      with: { ...(history && { history: true }) },
    });
  }

  static async getByEmail(email: string) {
    return await db.query.user.findFirst({
      where: eq(user.email, email),
      with: { history: true },
    });
  }

  static async create(data: UserDto) {
    await db
      .insert(user)
      .values({
        ...(await UserValidate.parseAsync(data)),
        created: new Date(),
      });
    return this.get(data.id);
  }

  static async update(id: string, data: Partial<User>) {
    await db
      .update(user)
      .set(UserValidate.omit({ id: true, owner: true }).partial().parse(data))
      .where(eq(user.id, id));
    return this.get(id);
  }

  static async delete(id: string) {
    await db.delete(user).where(eq(user.id, id));
  }
}
