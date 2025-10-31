import { log } from "../../log";
import { update1 } from "./update1";
import { update2 } from "./update2";
import { update3 } from "./update3";
import { getVersion } from "./version";

export async function migrate() {
  const version = await getVersion();
  log.info(`[db] migrate version: ${version}`);
  await update1();
  await update2();
  await update3();
}
