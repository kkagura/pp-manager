import { BaseEntity } from "../base/base.entity";

export class SourceEntity extends BaseEntity {
  name: string;
  path: string;
  shortcutId: number;
  projectId: number;
  description: string;
}
