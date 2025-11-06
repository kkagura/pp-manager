import { BaseEntity } from "../base/base.entity";

export class NoteEntity extends BaseEntity {
  title: string;
  html: string;
  text: string;
  isPinned: number; // 0: 未置顶, 1: 已置顶
}
