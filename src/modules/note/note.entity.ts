import { BaseEntity } from "../base/base.entity";

export class NoteEntity extends BaseEntity {
  title: string;
  html: string;
  text: string;
}
