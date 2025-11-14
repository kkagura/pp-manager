import { BaseService, Page, PageParams } from "../base/base.service";
import { ShortcutEntity } from "./shortcut.entity";
import { type ShortcutMapper } from "./shortcut.mapper";
import { ShortcutMapperKey, ShortcutServiceKey } from "./key";
import { ShortcutCreateDto, ShortcutListSearchDto } from "./shortcut.dto";
import { inject, injectable } from "@/di";
import { type SourceService } from "../source/source.service";
import { SourceServiceKey } from "../source/key";
import { Select } from "squel";

@injectable(ShortcutServiceKey)
export class ShortcutService extends BaseService<ShortcutEntity> {
  @inject(ShortcutMapperKey)
  mapper: ShortcutMapper;

  @inject(SourceServiceKey)
  sourceService: SourceService;

  builder(params: ShortcutListSearchDto): Select {
    const builder = this.mapper.builder();
    if (params.name) {
      builder.where("name like ?", `%${params.name}%`);
    }
    if (params.ids?.length) {
      const placeholders = params.ids.map(() => "?").join(",");
      builder.where(`id IN (${placeholders})`, ...params.ids);
    }
    builder.order("createdAt", false);
    return builder;
  }

  pageBuilder(params: PageParams<ShortcutListSearchDto>): Select {
    const builder = this.builder(params);
    const offset = (params.page - 1) * params.pageSize;
    builder.limit(params.pageSize).offset(offset);
    return builder;
  }

  list(searchDto: ShortcutListSearchDto): Promise<ShortcutEntity[]> {
    console.log('searchDto:', searchDto);
    const builder = this.builder(searchDto);
    return this.mapper.list(builder);
  }

  add(entity: ShortcutCreateDto) {
    return this.mapper.add(entity);
  }

  async page(
    params: PageParams<ShortcutListSearchDto>
  ): Promise<Page<ShortcutEntity>> {
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
    const sources = await this.sourceService.list({ shortcutId: id });
    if (sources.length > 0) {
      throw new Error("该快捷方式下有关联资源，不能删除");
    }
    return super.delete(id);
  }
}
