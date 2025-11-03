import { injectable } from "@/di";
import { BaseMapper } from "../base/base.mapper";
import { ShortcutEntity } from "./shortcut.entity";
import { ShortcutMapperKey } from "./key";

@injectable(ShortcutMapperKey)
export class ShortcutMapper extends BaseMapper<ShortcutEntity> {
  tableName = "shortcuts";
}
