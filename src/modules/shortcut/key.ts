import { InjectionKey } from "@/di";
import type { ShortcutService } from "./shortcut.service";
import type { ShortcutMapper } from "./shortcut.mapper";

export const ShortcutMapperKey: InjectionKey<ShortcutMapper> =
  Symbol("ShortcutMapper");
export const ShortcutServiceKey: InjectionKey<ShortcutService> =
  Symbol("ShortcutService");
