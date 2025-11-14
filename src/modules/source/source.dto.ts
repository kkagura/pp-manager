import { ShortcutEntity } from "../shortcut/shortcut.entity";
import { SourceEntity } from "./source.entity";

export class SourceListSearchDto {
  name?: string;
  projectId?: number;
  shortcutId?: number;
}

export class SourceListRecordDto extends SourceEntity {
  projectName: string;
  shortcut: ShortcutEntity;
}

export class SourceCreateDto {
  name: string;
  path: string;
  shortcutId: number | "";
  projectId: number | "";
  description: string;
  sort: number;
}
