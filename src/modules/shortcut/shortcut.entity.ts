import { BaseEntity } from "../base/base.entity";

export class ShortcutEntity extends BaseEntity {
  name: string;
  path: string;
  icon: string;
  description: string;
  sort: number;
}
