import { InjectionKey } from "@/di";
import type { SourceMapper } from "./source.mapper";
import type { SourceService } from "./source.service";

export const SourceMapperKey: InjectionKey<SourceMapper> =
  Symbol("SourceMapper");
export const SourceServiceKey: InjectionKey<SourceService> =
  Symbol("SourceService");
