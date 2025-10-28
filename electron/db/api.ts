import { log } from "../log";
import { db } from "./db";
/**
 * 执行查询语句，返回所有匹配的记录
 * @param sql SQL查询语句（如 SELECT）
 * @param params 可选参数，用于参数化查询
 * @returns 返回查询到的所有记录数组
 * @example
 * // 查询所有用户
 * const users = await query("SELECT * FROM users");
 *
 * // 参数化查询
 * const user = await query("SELECT * FROM users WHERE age > ?", [18]);
 */
function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    log.info(`[db] query: ${sql}`);
    db.all(sql, params || [], (err: Error | null, rows: T[]) => {
      if (err) {
        log.error(`[db] query error: ${err.message}`);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * 执行查询语句，返回单条记录
 * @param sql SQL查询语句
 * @param params 可选参数，用于参数化查询
 * @returns 返回单条记录，如果没有则返回undefined
 * @example
 * // 查询单个用户
 * const user = await queryOne("SELECT * FROM users WHERE id = ?", [1]);
 */
function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    log.info(`[db] queryOne: ${sql}`);
    db.get(sql, params || [], (err: Error | null, row: T) => {
      if (err) {
        log.error(`[db] queryOne error: ${err.message}`);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * 执行结果接口
 */
export interface ExecuteResult {
  id: number;
  changes: number;
}

/**
 * 执行修改语句（INSERT、UPDATE、DELETE等）
 * @param sql SQL修改语句
 * @param params 可选参数，用于参数化查询
 * @returns 返回执行结果，包含lastID（最后插入的ID）和changes（受影响的行数）
 * @example
 * // 插入数据
 * const result = await execute("INSERT INTO users (name, age) VALUES (?, ?)", ["张三", 25]);
 * console.log(result.lastID); // 新插入的ID
 *
 * // 更新数据
 * const result = await execute("UPDATE users SET age = ? WHERE id = ?", [30, 1]);
 * console.log(result.changes); // 受影响的行数
 */
function execute(sql: string, params?: any[]): Promise<ExecuteResult> {
  return new Promise((resolve, reject) => {
    log.info(`[db] execute: ${sql}`);
    db.run(sql, params || [], function (err: Error | null) {
      if (err) {
        log.error(`[db] execute error: ${err.message}`);
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          changes: this.changes,
        });
      }
    });
  });
}

export { query, queryOne, execute };
