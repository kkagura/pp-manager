import { log } from "../../log";
import { db } from "../db";
import { getVersion, setVersion } from "./version";

function createSourcesTable() {
  return new Promise((resolve, reject) => {
    const sql = `
    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      shortcutId INTEGER NOT NULL,
      projectId INTEGER NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
    db.prepare(sql).run((err: Error | null) => {
      if (err) {
        log.error("create sources table failed", err);
        reject(err);
      } else {
        log.info("create sources table success");
        resolve(true);
      }
    });
  });
}

export async function update3() {
  const version = await getVersion();
  if (version >= 3) return;
  await createSourcesTable();
  await setVersion(3);
}
