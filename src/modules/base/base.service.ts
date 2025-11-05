import { Select } from "squel";
import { BaseEntity } from "./base.entity";
import { BaseMapper } from "./base.mapper";
import { logMethod } from "@/utils/log";

export interface Page<T> {
  records: T[];
  total: number;
}

export type PageParams<T = unknown> = {
  page: number;
  pageSize: number;
} & T;

export abstract class BaseService<T extends BaseEntity> {
  abstract mapper: BaseMapper<T>;
  constructor() {}

  @logMethod()
  get(id: number): Promise<T | null> {
    return this.mapper.get(id);
  }

  @logMethod()
  list(_: any): Promise<T[]> {
    return this.mapper.list();
  }

  @logMethod()
  add(entity: T): Promise<unknown> {
    return this.mapper.add(entity);
  }

  @logMethod()
  update(entity: Partial<T> & { id: number }): Promise<unknown> {
    return this.mapper.update(entity);
  }

  pageBuilder(params: PageParams): Select {
    const builder = this.mapper.builder();
    const offset = (params.page - 1) * params.pageSize;
    builder.limit(params.pageSize).offset(offset);
    builder.order("createdAt", false);
    return builder;
  }

  @logMethod()
  async page<P extends PageParams>(params: P): Promise<Page<T>> {
    const builder = this.pageBuilder(params);
    const total = await this.mapper.total(builder);
    const records = await this.mapper.list(builder);
    return {
      records,
      total,
    };
  }

  @logMethod()
  delete(id: number): Promise<unknown> {
    return this.mapper.delete(id);
  }

  builder() {
    return this.mapper.builder();
  }
}
