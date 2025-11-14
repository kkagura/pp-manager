import { log } from "../../log";
import { db } from "../db";
import { getVersion, setVersion } from "./version";

function updateSortColumn() {
  return new Promise((resolve, reject) => {
    // 在projects、shortcuts、sources、notes表增加sort字段，并给已有数据添加默认值1
    const alterTableSqls = [
      `ALTER TABLE projects ADD COLUMN sort INTEGER DEFAULT 1`,
      `ALTER TABLE shortcuts ADD COLUMN sort INTEGER DEFAULT 1`,
      `ALTER TABLE sources ADD COLUMN sort INTEGER DEFAULT 1`,
      `ALTER TABLE notes ADD COLUMN sort INTEGER DEFAULT 1`,
    ];
    const run = (sql: string) => {
      return new Promise((resolve, reject) => {
        db.prepare(sql).run((err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    };

    // 顺序依次执行
    (async () => {
      try {
        for (let i = 0; i < alterTableSqls.length; i++) {
          try {
            await run(alterTableSqls[i]);
          } catch (err: any) {
            // sqlite3 若已添加字段会报错，忽略“duplicate column name”错误
            if (!/duplicate column name/i.test(String(err))) {
              log.error(`alter table failed: ${alterTableSqls[i]}`, err);
              return reject(err);
            } else {
              log.info(`column already exists, skip: ${alterTableSqls[i]}`);
            }
          }
        }
        log.info(
          "add sort column to all tables and update existing data success"
        );
        resolve(true);
      } catch (err) {
        log.error("add sort column failed", err);
        reject(err);
      }
    })();
  });
}

export async function update6() {
  const version = await getVersion();
  if (version >= 6) return;
  await updateSortColumn();
  await setVersion(6);
}
