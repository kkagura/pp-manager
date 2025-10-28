import { BaseEntity } from "../base/base.entity";

export class ProjectEntity extends BaseEntity {
  name: string;
  shortName: string;
  description: string;
}
