import { injectable } from "@/di";
import { BaseMapper } from "../base/base.mapper";
import { SourceEntity } from "./source.entity";
import { SourceMapperKey } from "./key";

@injectable(SourceMapperKey)
export class SourceMapper extends BaseMapper<SourceEntity> {
  tableName = "sources";
}
