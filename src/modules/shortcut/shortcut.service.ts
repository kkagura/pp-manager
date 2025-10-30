import { BaseService, Page, PageParams } from "../base/base.service";
import { ShortcutEntity } from "./shortcut.entity";
import { type ShortcutMapper, ShortcutMapperKey } from "./shortcut.mapper";
import { ShortcutCreateDto, ShortcutListSearchDto } from "./shortcut.dto";
import { inject, injectable, InjectionKey } from "@/di";
import { logMethod } from "@/utils/log";

export const ShortcutServiceKey: InjectionKey<ShortcutService> =
  Symbol("ShortcutService");
@injectable(ShortcutServiceKey)
export class ShortcutService extends BaseService<ShortcutEntity> {
  @inject(ShortcutMapperKey)
  mapper: ShortcutMapper;

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
    const total = await this.mapper.total(builder);
    const records = await this.mapper.list(builder);
    return {
      records,
      total,
    };
  }
}
