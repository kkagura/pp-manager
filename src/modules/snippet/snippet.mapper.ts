import { injectable } from "@/di";
import { BaseMapper } from "../base/base.mapper";
import { SnippetEntity } from "./snippet.entity";
import { SnippetMapperKey } from "./key";

@injectable(SnippetMapperKey)
export class SnippetMapper extends BaseMapper<SnippetEntity> {
  tableName = "snippets";
}
