import { BaseService, Page, PageParams } from "../base/base.service";
import { ProjectEntity } from "./project.entity";
import { type ProjectMapper } from "./project.mapper";
import { ProjectCreateDto, ProjectListSearchDto } from "./project.dto";
import { inject, injectable } from "@/di";
import { type SourceService } from "../source/source.service";
import { SourceServiceKey } from "../source/key";
import { ProjectMapperKey, ProjectServiceKey } from "./key";
@injectable(ProjectServiceKey)
export class ProjectService extends BaseService<ProjectEntity> {
  @inject(ProjectMapperKey)
  mapper: ProjectMapper;

  @inject(SourceServiceKey)
  sourceService: SourceService;

  list(searchDto: ProjectListSearchDto): Promise<ProjectEntity[]> {
    const builder = this.mapper.builder();
    if (searchDto.name) {
      builder.where("name like ?", `%${searchDto.name}%`);
    }
    builder.order("createdAt", false);
    return this.mapper.list(builder);
  }

  add(entity: ProjectCreateDto) {
    return this.mapper.add(entity);
  }

  async page(
    params: PageParams<ProjectListSearchDto>
  ): Promise<Page<ProjectEntity>> {
    const builder = this.pageBuilder(params);
    if (params.name) {
      builder.where("name like ?", `%${params.name}%`);
    }
    const total = await this.mapper.total(builder);
    const records = await this.mapper.list(builder);
    return {
      records,
      total,
    };
  }

  async delete(id: number): Promise<unknown> {
    const sources = await this.sourceService.list({ projectId: id });
    if (sources.length > 0) {
      throw new Error("该工作区下有关联资源，不能删除");
    }
    return super.delete(id);
  }
}
