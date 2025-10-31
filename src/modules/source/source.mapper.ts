import { injectable } from "@/di";
import { BaseMapper } from "../base/base.mapper";
import { SourceEntity } from "./source.entity";

export const SourceMapperKey = Symbol("SourceMapper");
@injectable(SourceMapperKey)
export class SourceMapper extends BaseMapper<SourceEntity> {
  tableName = "sources";
}
