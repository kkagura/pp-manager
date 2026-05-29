import { BaseEntity } from "../base/base.entity";

export class SnippetEntity extends BaseEntity {
  title: string;
  language: string;
  content: string;
  description: string;
  category: string;
  tags: string;
  isPinned: number;
  copyCount: number;
  lastCopiedAt?: string | null;
  sort?: number;
}
