import type { Database } from "sqlite3";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const sqlite3 = require("sqlite3");
export const db: Database = new sqlite3.Database("pp.db");