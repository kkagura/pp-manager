import { BaseMapper } from "../base/base.mapper";
import { ProjectEntity } from "./project.entity";

export class ProjectMapper extends BaseMapper<ProjectEntity> {
  constructor() {
    super("projects");
  }
}
