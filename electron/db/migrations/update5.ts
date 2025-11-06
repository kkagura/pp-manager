import { log } from "../../log";
import { db } from "../db";
import { getVersion, setVersion } from "./version";

function updateNotesTable() {
  return new Promise((resolve, reject) => {
    // 添加isPinned字段，默认值为0
    const sql = `
      ALTER TABLE notes ADD COLUMN isPinned INTEGER DEFAULT 0
    `;
    db.prepare(sql).run((err: Error | null) => {
      if (err) {
        log.error("add isPinned column to notes table failed", err);
        reject(err);
      } else {
        log.info("add isPinned column to notes table success");
        // 将已有数据的isPinned字段全部设置为0
        const updateSql = `UPDATE notes SET isPinned = 0`;
        db.prepare(updateSql).run((updateErr: Error | null) => {
          if (updateErr) {
            log.error("update existing notes isPinned field failed", updateErr);
            reject(updateErr);
          } else {
            log.info("update existing notes isPinned field success");
            resolve(true);
          }
        });
      }
    });
  });
}

export async function update5() {
  const version = await getVersion();
  if (version >= 5) return;
  await updateNotesTable();
  await setVersion(5);
}
