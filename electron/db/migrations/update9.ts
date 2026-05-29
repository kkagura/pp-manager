import { log } from "../../log";
import { db } from "../db";
import { getVersion, setVersion } from "./version";

function createSnippetsTable() {
  return new Promise((resolve, reject) => {
    const sql = `
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'text',
      content TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      isPinned INTEGER NOT NULL DEFAULT 0,
      copyCount INTEGER NOT NULL DEFAULT 0,
      lastCopiedAt DATETIME,
      sort INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
    db.prepare(sql).run((err: Error | null) => {
      if (err) {
        log.error("create snippets table failed", err);
        reject(err);
      } else {
        log.info("create snippets table success");
        resolve(true);
      }
    });
  });
}

export async function update9() {
  const version = await getVersion();
  if (version >= 9) return;
  await createSnippetsTable();
  await setVersion(9);
}
