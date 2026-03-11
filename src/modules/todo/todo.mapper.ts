import { injectable } from "@/di";
import { BaseMapper } from "../base/base.mapper";
import { TodoEntity } from "./todo.entity";
import { TodoMapperKey } from "./key";

@injectable(TodoMapperKey)
export class TodoMapper extends BaseMapper<TodoEntity> {
  tableName = "todos";
}

