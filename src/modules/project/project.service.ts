import { BaseService } from "../base/base.service";
import { ProjectEntity } from "./project.entity";
import { type ProjectMapper, ProjectMapperKey } from "./project.mapper";
import { ProjectCreateDto, ProjectListSearchDto } from "./project.dto";
import { inject, injectable, InjectionKey } from "@/di";

export const ProjectServiceKey: InjectionKey<ProjectService> =
  Symbol("ProjectService");
@injectable(ProjectServiceKey)
export class ProjectService extends BaseService<ProjectEntity> {
  @inject(ProjectMapperKey)
  mapper: ProjectMapper;

  list(searchDto: ProjectListSearchDto): Promise<ProjectEntity[]> {
    const builder = this.mapper.builder();
    if (searchDto.name) {
      builder.where("name like ?", `%${searchDto.name}%`);
    }
    builder.order("createdAt", false);
    return this.mapper.list(builder);
  }

  add(entity: ProjectCreateDto): Promise<unknown> {
    return this.mapper.add(entity);
  }
}
