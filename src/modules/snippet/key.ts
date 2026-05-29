import { InjectionKey } from "@/di";
import type { SnippetMapper } from "./snippet.mapper";
import type { SnippetService } from "./snippet.service";

export const SnippetMapperKey: InjectionKey<SnippetMapper> =
  Symbol("SnippetMapper");
export const SnippetServiceKey: InjectionKey<SnippetService> =
  Symbol("SnippetService");
