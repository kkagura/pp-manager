import { TodoStatus } from "./todo.entity";

export class TodoListSearchDto {
  title?: string;
  status?: TodoStatus;
  expectedFinishAtStart?: string;
  expectedFinishAtEnd?: string;
}

export class TodoCreateDto {
  title: string;
  descriptionHtml: string;
  descriptionText: string;
  status: TodoStatus;
  expectedFinishAt?: string | null;
  actualFinishAt?: string | null;
  isLongTerm: number;
}

