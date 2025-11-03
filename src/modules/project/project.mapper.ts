import { injectable } from "@/di";
import { BaseMapper } from "../base/base.mapper";
import { ProjectEntity } from "./project.entity";
import { ProjectMapperKey } from "./key";

@injectable(ProjectMapperKey)
export class ProjectMapper extends BaseMapper<ProjectEntity> {
  tableName = "projects";
}
