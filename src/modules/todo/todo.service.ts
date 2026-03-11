import { inject, injectable } from "@/di";
import { BaseService } from "../base/base.service";
import { type TodoMapper } from "./todo.mapper";
import { TodoMapperKey, TodoServiceKey } from "./key";
import { TodoCreateDto, TodoListSearchDto } from "./todo.dto";
import { TodoEntity, TodoStatus } from "./todo.entity";

@injectable(TodoServiceKey)
export class TodoService extends BaseService<TodoEntity> {
  @inject(TodoMapperKey)
  mapper: TodoMapper;

  list(searchDto: TodoListSearchDto): Promise<TodoEntity[]> {
    const builder = this.mapper.builder();
    if (searchDto.title) {
      builder.where("title like ?", `%${searchDto.title}%`);
    }
    if (searchDto.status !== undefined) {
      builder.where("status = ?", searchDto.status);
    }
    if (searchDto.expectedFinishAtStart) {
      builder.where("expectedFinishAt >= ?", searchDto.expectedFinishAtStart);
    }
    if (searchDto.expectedFinishAtEnd) {
      builder.where("expectedFinishAt <= ?", searchDto.expectedFinishAtEnd);
    }
    builder.order("sort", true);
    builder.order("createdAt", false);
    return this.mapper.list(builder);
  }

  add(entity: TodoCreateDto): Promise<{ id: number }> {
    return this.mapper.add({
      ...entity,
      status: entity.status ?? TodoStatus.Executing,
      isLongTerm: entity.isLongTerm ?? 0,
      descriptionHtml: entity.descriptionHtml ?? "",
      descriptionText: entity.descriptionText ?? "",
    });
  }
}

