import { Container, InjectionKey } from "@/di";
import { ProjectMapper, ProjectMapperKey } from "./project/project.mapper";
import { ProjectService, ProjectServiceKey } from "./project/project.service";

const container = new Container();

container.bind(ProjectMapperKey, ProjectMapper);
container.bind(ProjectServiceKey, ProjectService);

export const getService = <T>(key: InjectionKey<T>): T => {
  return container.get(key);
};

export { ProjectServiceKey };
