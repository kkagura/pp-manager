import squel, { type Select } from "squel";
import { BaseEntity } from "./base.entity";
import dayjs from "dayjs";

const db = window.ipcRenderer as unknown as {
  dbQuery: <T>(sql: string, params?: any[]) => Promise<T[]>;
  dbQueryOne: <T>(sql: string, params?: any[]) => Promise<T | null>;
  dbExecute: (sql: string, params?: any[]) => Promise<{ id: number }>;
};

export abstract class BaseMapper<T extends BaseEntity> {
  db = db;
  abstract tableName: string;

  constructor() {}

  get(id: number): Promise<T | null> {
    const query = squel
      .select()
      .from(this.tableName)
      .where("id=?", id);
    const { text: sql, values: params } = query.toParam();
    return this.db.dbQueryOne<T>(sql, params);
  }

  list(s?: Select): Promise<any[]> {
    if (!s) {
      s = squel.select().from(this.tableName).order("createdAt", false);
    }
    const { text: sql, values: params } = s.toParam();
    return this.db.dbQuery<T>(sql, params);
  }

  total(s: Select): Promise<number> {
    const query = s.clone().field("COUNT(*)", "total");
    const { text: sql, values: params } = query.toParam();
    return this.db
      .dbQueryOne<{ total: number }>(sql, params)
      .then((res) => res?.total ?? 0);
  }

  add(entity: any): Promise<{ id: number }> {
    let insert = squel.insert().into(this.tableName);
    insert = Object.keys(entity).reduce((prev, curr) => {
      return prev.set(curr, entity[curr as keyof typeof entity]);
    }, insert);
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    insert.set("createdAt", now);
    insert.set("updatedAt", now);
    const { text: sql, values: params } = insert.toParam();
    return this.db.dbExecute(sql, params);
  }

  update(entity: Partial<T> & { id: number }) {
    let update = squel.update().table(this.tableName).where("id=?", entity.id);
    update = Object.keys(entity).reduce((prev, curr) => {
      return prev.set(curr, entity[curr as keyof T]);
    }, update);
    update.set("updatedAt", dayjs().format("YYYY-MM-DD HH:mm:ss"));
    const { text: sql, values: params } = update.toParam();
    return this.db.dbExecute(sql, params);
  }

  delete(id: number) {
    const query = squel
      .delete()
      .from(this.tableName)
      .where("id=?", id);
    const { text: sql, values: params } = query.toParam();
    return this.db.dbExecute(sql, params);
  }

  builder() {
    return squel.select().from(this.tableName);
  }
}
