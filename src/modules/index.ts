import { Container, InjectionKey } from "@/di";
import { ProjectMapper, ProjectMapperKey } from "./project/project.mapper";
import { ProjectService, ProjectServiceKey } from "./project/project.service";
import { ShortcutMapper, ShortcutMapperKey } from "./shortcut/shortcut.mapper";
import {
  ShortcutService,
  ShortcutServiceKey,
} from "./shortcut/shortcut.service";
import { SourceService, SourceServiceKey } from "./source/source.service";
import { SourceMapper, SourceMapperKey } from "./source/source.mapper";

const container = new Container();

container.bind(ProjectMapperKey, ProjectMapper);
container.bind(ProjectServiceKey, ProjectService);

container.bind(ShortcutMapperKey, ShortcutMapper);
container.bind(ShortcutServiceKey, ShortcutService);

container.bind(SourceMapperKey, SourceMapper);
container.bind(SourceServiceKey, SourceService);

export const getService = <T>(key: InjectionKey<T>): T => {
  return container.get(key);
};

export { ProjectServiceKey, ShortcutServiceKey, SourceServiceKey };
