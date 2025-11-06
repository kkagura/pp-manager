import { BaseService, Page, PageParams } from "../base/base.service";
import { NoteEntity } from "./note.entity";
import { type NoteMapper } from "./note.mapper";
import { NoteMapperKey, NoteServiceKey } from "./key";
import { NoteCreateDto, NoteListSearchDto } from "./note.dto";
import { inject, injectable } from "@/di";
import { type SourceService } from "../source/source.service";
import { SourceServiceKey } from "../source/key";

@injectable(NoteServiceKey)
export class NoteService extends BaseService<NoteEntity> {
  @inject(NoteMapperKey)
  mapper: NoteMapper;

  @inject(SourceServiceKey)
  sourceService: SourceService;

  list(searchDto: NoteListSearchDto): Promise<NoteEntity[]> {
    const builder = this.mapper.builder();
    if (searchDto.title) {
      builder.where("title like ?", `%${searchDto.title}%`);
    }
    builder.order("isPinned", false);
    builder.order("createdAt", false);
    return this.mapper.list(builder);
  }

  add(entity: NoteCreateDto): Promise<{ id: number }> {
    return this.mapper.add(entity);
  }

  async page(params: PageParams<NoteListSearchDto>): Promise<Page<NoteEntity>> {
    const builder = this.pageBuilder(params);
    if (params.title) {
      builder.where("title like ?", `%${params.title}%`);
    }
    // 先按置顶排序，再按创建时间排序
    // 需要先清除 pageBuilder 中的 createdAt 排序，然后重新添加
    builder.order("isPinned", false);
    builder.order("createdAt", false);
    const total = await this.mapper.total(builder);
    const records = await this.mapper.list(builder);
    return {
      records,
      total,
    };
  }
}
