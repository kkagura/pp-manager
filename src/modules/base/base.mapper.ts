import squel, { type Select } from "squel";
import { BaseEntity } from "./base.entity";
import dayjs from "dayjs";

const db = window.ipcRenderer as unknown as {
  dbQuery: <T>(sql: string) => Promise<T[]>;
  dbQueryOne: <T>(sql: string) => Promise<T | null>;
  dbExecute: (sql: string) => Promise<void>;
};

export abstract class BaseMapper<T extends BaseEntity> {
  db = db;
  abstract tableName: string;

  constructor() {}

  get(id: number): Promise<T | null> {
    const sql = squel
      .select()
      .from(this.tableName)
      .where("id=?", id)
      .toString();
    return this.db.dbQueryOne<T>(sql);
  }

  list(s?: Select): Promise<any> {
    if (!s) {
      s = squel.select().from(this.tableName).order("createdAt", false);
    }
    const sql = s.toString();
    return this.db.dbQuery<T>(sql);
  }

  total(s: Select): Promise<number> {
    const sql = s.clone().field("COUNT(*)", "total").toString();
    return this.db
      .dbQueryOne<{ total: number }>(sql)
      .then((res) => res?.total ?? 0);
  }

  add(entity: Partial<T>) {
    let insert = squel.insert().into(this.tableName);
    insert = Object.keys(entity).reduce((prev, curr) => {
      return prev.set(curr, entity[curr as keyof T]);
    }, insert);
    const sql = insert.toString();
    return this.db.dbExecute(sql);
  }

  update(entity: Partial<T> & { id: number }) {
    let update = squel.update().table(this.tableName).where("id=?", entity.id);
    update = Object.keys(entity).reduce((prev, curr) => {
      return prev.set(curr, entity[curr as keyof T]);
    }, update);
    update.set("updatedAt", dayjs().format("YYYY-MM-DD HH:mm:ss"));
    const sql = update.toString();
    return this.db.dbExecute(sql);
  }

  delete(id: number) {
    const sql = squel
      .delete()
      .from(this.tableName)
      .where("id=?", id)
      .toString();
    return this.db.dbExecute(sql);
  }

  builder() {
    return squel.select().from(this.tableName);
  }
}
