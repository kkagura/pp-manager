import dayjs from "dayjs";
import { inject, injectable } from "@/di";
import { BaseService } from "../base/base.service";
import { type SnippetMapper } from "./snippet.mapper";
import { SnippetMapperKey, SnippetServiceKey } from "./key";
import { SnippetCreateDto, SnippetListSearchDto } from "./snippet.dto";
import { SnippetEntity } from "./snippet.entity";

@injectable(SnippetServiceKey)
export class SnippetService extends BaseService<SnippetEntity> {
  @inject(SnippetMapperKey)
  mapper: SnippetMapper;

  list(searchDto: SnippetListSearchDto): Promise<SnippetEntity[]> {
    const builder = this.mapper.builder();
    const keyword = searchDto.keyword?.trim();

    if (keyword) {
      builder.where(
        "(title like ? or description like ? or content like ? or tags like ?)",
        `%${keyword}%`,
        `%${keyword}%`,
        `%${keyword}%`,
        `%${keyword}%`
      );
    }
    if (searchDto.language) {
      builder.where("language = ?", searchDto.language);
    }
    if (searchDto.category) {
      builder.where("category = ?", searchDto.category);
    }
    if (searchDto.tag) {
      builder.where("tags like ?", `%"${searchDto.tag}"%`);
    }

    builder.order("isPinned", false);
    builder.order("copyCount", false);
    builder.order("updatedAt", false);
    return this.mapper.list(builder);
  }

  add(entity: SnippetCreateDto): Promise<{ id: number }> {
    return this.mapper.add({
      ...entity,
      language: entity.language || "text",
      description: entity.description ?? "",
      category: entity.category ?? "",
      tags: entity.tags || "[]",
      isPinned: entity.isPinned ?? 0,
      sort: entity.sort ?? 1,
    });
  }

  async recordCopy(id: number): Promise<unknown> {
    const snippet = await this.get(id);
    if (!snippet) return;

    return this.update({
      id,
      copyCount: (snippet.copyCount ?? 0) + 1,
      lastCopiedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    });
  }
}
