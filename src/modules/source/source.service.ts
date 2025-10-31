import { BaseService, Page, PageParams } from "../base/base.service";
import { SourceEntity } from "./source.entity";
import { type SourceMapper, SourceMapperKey } from "./source.mapper";
import { SourceCreateDto, SourceListSearchDto } from "./source.dto";
import { inject, injectable, InjectionKey } from "@/di";
import { logMethod } from "@/utils/log";
import squel from "squel";

export const SourceServiceKey: InjectionKey<SourceService> =
  Symbol("SourceService");
@injectable(SourceServiceKey)
export class SourceService extends BaseService<SourceEntity> {
  @inject(SourceMapperKey)
  mapper: SourceMapper;

  @logMethod()
  list(searchDto: SourceListSearchDto): Promise<SourceEntity[]> {
    const builder = this.mapper.builder();
    if (searchDto.name) {
      builder.where("name like ?", `%${searchDto.name}%`);
    }
    if (searchDto.projectId) {
      builder.where("projectId = ?", searchDto.projectId);
    }
    if (searchDto.shortcutId) {
      builder.where("shortcutId = ?", searchDto.shortcutId);
    }
    const projectBuilder = squel.select().from("projects");
    builder.left_join(
      projectBuilder.field("id", "projectId").field("name", "projectName"),
      "projects",
      `${this.mapper.tableName}.projectId=projects.projectId`
    );

    builder.order("createdAt", false);
    return this.mapper.list(builder);
  }

  @logMethod()
  add(entity: SourceCreateDto): Promise<unknown> {
    return this.mapper.add({
      ...entity,
      shortcutId: entity.shortcutId ? Number(entity.shortcutId) : undefined,
      projectId: entity.projectId ? Number(entity.projectId) : undefined,
    });
  }

  @logMethod()
  async page(
    params: PageParams<SourceListSearchDto>
  ): Promise<Page<SourceEntity>> {
    const builder = this.pageBuilder(params);
    if (params.name) {
      builder.where("name like ?", `%${params.name}%`);
    }
    const total = await this.mapper.total(builder);
    const recordBuilder = builder.clone();
    const projectBuilder = squel.select().from("projects");
    recordBuilder.left_join(
      projectBuilder.field("id", "projectId").field("name", "projectName"),
      "projects",
      `${this.mapper.tableName}.projectId=projects.projectId`
    );

    const records = await this.mapper.list(recordBuilder);
    return {
      records,
      total,
    };
  }
}
