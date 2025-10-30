import { log } from "../../log";
import { db } from "../db";
import { getVersion, setVersion } from "./version";

function createShortcutsTable() {
  return new Promise((resolve, reject) => {
    const sql = `
    CREATE TABLE IF NOT EXISTS shortcuts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
    db.prepare(sql).run((err: Error | null) => {
      if (err) {
        log.error("create shortcuts table failed", err);
        reject(err);
      } else {
        log.info("create shortcuts table success");
        resolve(true);
      }
    });
  });
}

export async function update2() {
  const version = await getVersion();
  if (version >= 2) return;
  await createShortcutsTable();
  await setVersion(2);
}
