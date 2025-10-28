import { BaseService } from "../base/base.service";
import { ProjectEntity } from "./project.entity";
import { ProjectMapper } from "./project.mapper";

export class ProjectService extends BaseService<ProjectEntity> {
  constructor() {
    super(new ProjectMapper());
  }
}
