import { BaseService, Page, PageParams } from "../base/base.service";
import { SourceEntity } from "./source.entity";
import { type SourceMapper } from "./source.mapper";
import {
  SourceCreateDto,
  SourceListRecordDto,
  SourceListSearchDto,
} from "./source.dto";
import { inject, injectable } from "@/di";
import squel, { Select } from "squel";
import { type ShortcutService } from "../shortcut/shortcut.service";
import { ShortcutEntity } from "../shortcut/shortcut.entity";
import { SourceMapperKey, SourceServiceKey } from "./key";
import { ShortcutServiceKey } from "../shortcut/key";
@injectable(SourceServiceKey)
export class SourceService extends BaseService<SourceEntity> {
  @inject(SourceMapperKey)
  mapper: SourceMapper;

  @inject(ShortcutServiceKey)
  shortcutService: ShortcutService;

  async list(searchDto: SourceListSearchDto): Promise<SourceListRecordDto[]> {
    const builder = this.builder(searchDto);
    if (searchDto.name) {
      builder.where("name like ?", `%${searchDto.name}%`);
    }
    if (searchDto.shortcutId) {
      builder.where("shortcutId = ?", searchDto.shortcutId);
    }
    const projectBuilder = squel.select().from("projects");
    builder.left_join(
      projectBuilder.field("id", "pId").field("name", "projectName"),
      "projects",
      `${this.mapper.tableName}.projectId=projects.pId`
    );

    builder.order("sort", true);
    builder.order("createdAt", false);
    const records = (await this.mapper.list(builder)) as SourceListRecordDto[];
    let shortcutIds = records.map((it) => it.shortcutId);
    shortcutIds = [...new Set(shortcutIds)];
    const shortcuts = await this.shortcutService.list({
      ids: shortcutIds,
    });
    let shortcutMap = new Map<number, ShortcutEntity>();
    shortcuts.forEach((it) => {
      shortcutMap.set(it.id, it);
    });
    records.forEach((it) => {
      it.shortcut = shortcutMap.get(it.shortcutId)!;
    });

    return records;
  }

  add(entity: SourceCreateDto) {
    return this.mapper.add({
      ...entity,
      shortcutId: entity.shortcutId ? Number(entity.shortcutId) : undefined,
      projectId: entity.projectId ? Number(entity.projectId) : undefined,
    });
  }
  pageBuilder(params: PageParams<SourceListSearchDto>): Select {
    const builder = this.builder(params);
    const offset = (params.page - 1) * params.pageSize;
    builder.limit(params.pageSize).offset(offset);
    return builder;
  }

  builder(params: SourceListSearchDto): Select {
    const builder = this.mapper.builder();
    if (params.name) {
      builder.where("name like ?", `%${params.name}%`);
    }
    if (params.projectId) {
      builder.where("projectId = ?", params.projectId);
    }
    builder.order("sort", true);
    builder.order("createdAt", false);
    return builder;
  }

  async page(
    params: PageParams<SourceListSearchDto>
  ): Promise<Page<SourceListRecordDto>> {
    const builder = this.pageBuilder(params);
    const totalBuilder = this.builder(params);
    const total = await this.mapper.total(totalBuilder);
    const recordBuilder = builder.clone();
    const projectBuilder = squel.select().from("projects");
    recordBuilder.left_join(
      projectBuilder.field("id", "pId").field("name", "projectName"),
      "projects",
      `${this.mapper.tableName}.projectId=projects.pId`
    );

    const records = (await this.mapper.list(
      recordBuilder
    )) as SourceListRecordDto[];
    let shortcutIds = records.map((it) => it.shortcutId);
    shortcutIds = [...new Set(shortcutIds)];
    const shortcuts = await this.shortcutService.list({
      ids: shortcutIds,
    });
    let shortcutMap = new Map<number, ShortcutEntity>();
    shortcuts.forEach((it) => {
      shortcutMap.set(it.id, it);
    });
    records.forEach((it) => {
      it.shortcut = shortcutMap.get(it.shortcutId)!;
    });
    return {
      records,
      total,
    };
  }
}
