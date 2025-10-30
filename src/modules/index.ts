import { Container, InjectionKey } from "@/di";
import { ProjectMapper, ProjectMapperKey } from "./project/project.mapper";
import { ProjectService, ProjectServiceKey } from "./project/project.service";
import { ShortcutMapper, ShortcutMapperKey } from "./shortcut/shortcut.mapper";
import {
  ShortcutService,
  ShortcutServiceKey,
} from "./shortcut/shortcut.service";

const container = new Container();

container.bind(ProjectMapperKey, ProjectMapper);
container.bind(ProjectServiceKey, ProjectService);

container.bind(ShortcutMapperKey, ShortcutMapper);
container.bind(ShortcutServiceKey, ShortcutService);

export const getService = <T>(key: InjectionKey<T>): T => {
  return container.get(key);
};

export { ProjectServiceKey, ShortcutServiceKey };
