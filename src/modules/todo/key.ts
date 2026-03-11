import { InjectionKey } from "@/di";
import type { TodoService } from "./todo.service";
import type { TodoMapper } from "./todo.mapper";

export const TodoMapperKey: InjectionKey<TodoMapper> = Symbol("TodoMapper");
export const TodoServiceKey: InjectionKey<TodoService> = Symbol("TodoService");

