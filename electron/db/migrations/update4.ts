import { log } from "../../log";
import { db } from "../db";
import { getVersion, setVersion } from "./version";

function createNotesTable() {
  return new Promise((resolve, reject) => {
    const sql = `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      html TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
    db.prepare(sql).run((err: Error | null) => {
      if (err) {
        log.error("create notes table failed", err);
        reject(err);
      } else {
        log.info("create notes table success");
        resolve(true);
      }
    });
  });
}

export async function update4() {
  const version = await getVersion();
  if (version >= 4) return;
  await createNotesTable();
  await setVersion(4);
}
