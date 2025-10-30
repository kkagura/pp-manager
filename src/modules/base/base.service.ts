import { BaseEntity } from "./base.entity";
import { BaseMapper } from "./base.mapper";

export interface Page<T> {
  records: T[];
  total: number;
}

export interface PageParams {
  page: number;
  pageSize: number;
}

export abstract class BaseService<T extends BaseEntity> {
  abstract mapper: BaseMapper<T>;
  constructor() {}

  get(id: number): Promise<T | null> {
    return this.mapper.get(id);
  }

  list(_: any): Promise<T[]> {
    return this.mapper.list();
  }

  add(entity: T): Promise<unknown> {
    return this.mapper.add(entity);
  }

  async page<P extends PageParams>(params: P): Promise<Page<T>> {
    const builder = this.mapper.builder();
    const offset = (params.page - 1) * params.pageSize;
    builder.limit(params.pageSize).offset(offset);
    const total = await this.mapper.total(builder);
    const records = await this.mapper.list(builder);
    return {
      records,
      total,
    };
  }

  // add()
}
