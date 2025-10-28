import { BaseService } from "../base/base.service";
import { ProjectEntity } from "./project.entity";
import { ProjectMapper } from "./project.mapper";
import { ProjectListSearchDto } from "./project.dto";

export class ProjectService extends BaseService<ProjectEntity> {
  constructor() {
    super(new ProjectMapper());
  }

  list(searchDto: ProjectListSearchDto): Promise<ProjectEntity[]> {
    const builder = this.mapper.builder();
    if (searchDto.name) {
      builder.where("name like ?", `%${searchDto.name}%`);
    }
    builder.order("created_at", false);
    return this.mapper.list(builder);
  }
}
