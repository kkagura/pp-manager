import { log } from "../../log";
import { db } from "../db";
import { getVersion, setVersion } from "./version";

function createTodosTable() {
  return new Promise((resolve, reject) => {
    const sql = `
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      descriptionHtml TEXT NOT NULL DEFAULT '',
      descriptionText TEXT NOT NULL DEFAULT '',
      status INTEGER NOT NULL DEFAULT 0,
      expectedFinishAt DATETIME,
      actualFinishAt DATETIME,
      isLongTerm INTEGER NOT NULL DEFAULT 0,
      sort INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
    db.prepare(sql).run((err: Error | null) => {
      if (err) {
        log.error("create todos table failed", err);
        reject(err);
      } else {
        log.info("create todos table success");
        resolve(true);
      }
    });
  });
}

export async function update8() {
  const version = await getVersion();
  if (version >= 8) return;
  await createTodosTable();
  await setVersion(8);
}

