import { InjectionKey } from "@/di";
import type { NoteService } from "./note.service";
import type { NoteMapper } from "./note.mapper";

export const NoteMapperKey: InjectionKey<NoteMapper> = Symbol("NoteMapper");
export const NoteServiceKey: InjectionKey<NoteService> = Symbol("NoteService");
