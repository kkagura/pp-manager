import { db } from "../db";
import { execute } from "../api";

export function getVersion() {
  return new Promise<number>((resolve, reject) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='app_version'`,
      [],
      (err: Error | null, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        if (row) {
          // table exists, query max version
          db.get(
            `SELECT MAX(version) as version FROM app_version`,
            [],
            (err: Error | null, row: any) => {
              if (err) {
                reject(err);
              } else {
                resolve(row?.version ?? 0);
              }
            }
          );
        } else {
          // table does not exist, create and insert version 0
          db.run(
            `CREATE TABLE IF NOT EXISTS app_version (version INTEGER NOT NULL)`,
            [],
            (err: Error | null) => {
              if (err) {
                reject(err);
                return;
              }
              db.run(
                `INSERT INTO app_version (version) VALUES (0)`,
                [],
                function (err: Error | null) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(0);
                  }
                }
              );
            }
          );
        }
      }
    );
  });
}

export function setVersion(version: number) {
  return execute(`UPDATE app_version SET version = ?`, [version]);
}
