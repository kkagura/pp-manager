import { injectable } from "@/di";
import { BaseMapper } from "../base/base.mapper";
import { ShortcutEntity } from "./shortcut.entity";

export const ShortcutMapperKey = Symbol("ShortcutMapper");
@injectable(ShortcutMapperKey)
export class ShortcutMapper extends BaseMapper<ShortcutEntity> {
  tableName = "shortcuts";
}
