import { log } from "../../log";
import { db } from "../db";
import { getVersion, setVersion } from "./version";

function updateShortcutsTable() {
  return new Promise((resolve, reject) => {
    // 添加alias字段，非必填，字符串类型
    const sql = `
      ALTER TABLE shortcuts ADD COLUMN alias TEXT
    `;
    db.prepare(sql).run((err: Error | null) => {
      if (err) {
        // sqlite3 若已添加字段会报错，忽略"duplicate column name"错误
        if (/duplicate column name/i.test(String(err))) {
          log.info("alias column already exists, skip");
          resolve(true);
        } else {
          log.error("add alias column to shortcuts table failed", err);
          reject(err);
        }
      } else {
        log.info("add alias column to shortcuts table success");
        resolve(true);
      }
    });
  });
}

export async function update7() {
  const version = await getVersion();
  if (version >= 7) return;
  await updateShortcutsTable();
  await setVersion(7);
}
