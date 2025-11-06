import { injectable } from "@/di";
import { BaseMapper } from "../base/base.mapper";
import { NoteEntity } from "./note.entity";
import { NoteMapperKey } from "./key";

@injectable(NoteMapperKey)
export class NoteMapper extends BaseMapper<NoteEntity> {
  tableName = "notes";
}
