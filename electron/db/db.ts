import type { Database } from "sqlite3";
import { createRequire } from "module";
import path from "node:path";
import { app } from "electron";
const require = createRequire(import.meta.url);

const sqlite3 = require("sqlite3");
const dbPath = path.join(app.getPath("userData"), "pp.db");
console.log(dbPath);
export const db: Database = new sqlite3.Database(dbPath);
