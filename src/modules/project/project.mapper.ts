import { injectable } from "@/di";
import { BaseMapper } from "../base/base.mapper";
import { ProjectEntity } from "./project.entity";

export const ProjectMapperKey = Symbol("ProjectMapper");
@injectable(ProjectMapperKey)
export class ProjectMapper extends BaseMapper<ProjectEntity> {
  tableName = "projects";
}
