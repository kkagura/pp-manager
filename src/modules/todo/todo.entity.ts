import { BaseEntity } from "../base/base.entity";

export enum TodoStatus {
  Executing = 0,
  Completed = 1,
  Paused = 2,
  Overdue = 3,
}

export class TodoEntity extends BaseEntity {
  title: string;
  descriptionHtml: string;
  descriptionText: string;
  status: TodoStatus;
  expectedFinishAt?: string | null;
  actualFinishAt?: string | null;
  isLongTerm: number; // 0: 否, 1: 是
  sort?: number;
}

