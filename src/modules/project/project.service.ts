import { BaseService, Page, PageParams } from "../base/base.service";
import { ProjectEntity } from "./project.entity";
import { type ProjectMapper } from "./project.mapper";
import { ProjectCreateDto, ProjectListSearchDto } from "./project.dto";
import { inject, injectable } from "@/di";
import { type SourceService } from "../source/source.service";
import { SourceServiceKey } from "../source/key";
import { ProjectMapperKey, ProjectServiceKey } from "./key";
import { Select } from "squel";
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
    builder.order("sort", true);
    builder.order("createdAt", false);
    return this.mapper.list(builder);
  }

  add(entity: ProjectCreateDto) {
    return this.mapper.add(entity);
  }
  
  pageBuilder(params: PageParams<ProjectListSearchDto>): Select {
    const builder = this.builder(params);
    const offset = (params.page - 1) * params.pageSize;
    builder.limit(params.pageSize).offset(offset);
    return builder;
  }

  builder(params: ProjectListSearchDto): Select {
    const builder = this.mapper.builder();
    if (params.name) {
      builder.where("name like ?", `%${params.name}%`);
    }
    builder.order("sort", true);
    builder.order("createdAt", false);
    return builder;
  }

  async page(
    params: PageParams<ProjectListSearchDto>
  ): Promise<Page<ProjectEntity>> {
    const builder = this.pageBuilder(params);
    const totalBuilder = this.builder(params);
    const total = await this.mapper.total(totalBuilder);
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
