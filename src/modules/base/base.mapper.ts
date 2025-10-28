import squel, { type Select } from "squel";
import { BaseEntity } from "./base.entity";

const db = window.ipcRenderer as unknown as {
  dbQuery: <T>(sql: string) => Promise<T[]>;
  dbQueryOne: <T>(sql: string) => Promise<T | null>;
  dbExecute: (sql: string) => Promise<void>;
};

export class BaseMapper<T extends BaseEntity> {
  db = db;

  constructor(public tableName: string) {}

  get(id: number): Promise<T | null> {
    const sql = squel
      .select()
      .from(this.tableName)
      .where("id=?", id)
      .toString();
    return this.db.dbQueryOne<T>(sql);
  }

  list(s?: Select): Promise<T[]> {
    if (!s) {
      s = squel.select().from(this.tableName).order("created_at", false);
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

  // add(entity: T) {
  //   let insert = squel.insert().into(this.tableName);
  //   insert = Object.keys(entity).reduce((prev, curr) => {
  //     return prev.set(curr, entity[curr as keyof T]);
  //   }, insert);
  //   const sql = insert.toString();
  //   return this.db.dbExecute(sql);
  // }

  builder() {
    return squel.select().from(this.tableName);
  }
}
