import { log } from "../../log";
import { db } from "../db";
import { getVersion, setVersion } from "./version";

function createProjectTable() {
  return new Promise((resolve, reject) => {
    const sql = `
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      short_name TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
    db.prepare(sql).run((err: Error | null) => {
      if (err) {
        log.error("create project table failed", err);
        reject(err);
      } else {
        log.info("create project table success");
        resolve(true);
      }
    });
  });
}

export async function update1() {
  const version = await getVersion();
  if (version >= 1) return;
  await createProjectTable();
  await setVersion(1);
}
