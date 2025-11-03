import { BaseService, Page, PageParams } from "../base/base.service";
import { ShortcutEntity } from "./shortcut.entity";
import { type ShortcutMapper } from "./shortcut.mapper";
import { ShortcutMapperKey, ShortcutServiceKey } from "./key";
import { ShortcutCreateDto, ShortcutListSearchDto } from "./shortcut.dto";
import { inject, injectable } from "@/di";
import { logMethod } from "@/utils/log";
import { type SourceService } from "../source/source.service";
import { SourceServiceKey } from "../source/key";

@injectable(ShortcutServiceKey)
export class ShortcutService extends BaseService<ShortcutEntity> {
  @inject(ShortcutMapperKey)
  mapper: ShortcutMapper;

  @inject(SourceServiceKey)
  sourceService: SourceService;

  @logMethod()
  list(searchDto: ShortcutListSearchDto): Promise<ShortcutEntity[]> {
    const builder = this.mapper.builder();
    if (searchDto.name) {
      builder.where("name like ?", `%${searchDto.name}%`);
    }
    builder.order("createdAt", false);
    return this.mapper.list(builder);
  }

  @logMethod()
  add(entity: ShortcutCreateDto): Promise<unknown> {
    return this.mapper.add(entity);
  }

  @logMethod()
  async page(
    params: PageParams<ShortcutListSearchDto>
  ): Promise<Page<ShortcutEntity>> {
    const builder = this.pageBuilder(params);
    if (params.name) {
      builder.where("name like ?", `%${params.name}%`);
    }
    if (params.ids?.length) {
      builder.where("id in (?)", params.ids);
    }
    const total = await this.mapper.total(builder);
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
