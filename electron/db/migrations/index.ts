import { log } from "../../log";
import { update1 } from "./update1";
import { getVersion } from "./version";

export async function migrate() {
  const version = await getVersion();
  log.info(`[db] migrate version: ${version}`);
  await update1();
}
