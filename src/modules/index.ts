import { Container, InjectionKey } from "@/di";
import { ProjectMapper } from "./project/project.mapper";
import { ProjectMapperKey, ProjectServiceKey } from "./project/key";
import { ProjectService } from "./project/project.service";
import { ShortcutMapper } from "./shortcut/shortcut.mapper";
import { ShortcutMapperKey } from "./shortcut/key";
import { ShortcutServiceKey } from "./shortcut/key";
import { SourceService } from "./source/source.service";
import { SourceServiceKey } from "./source/key";
import { SourceMapper } from "./source/source.mapper";
import { SourceMapperKey } from "./source/key";
import { ShortcutService } from "./shortcut/shortcut.service";
import { NoteMapper } from "./note/note.mapper";
import { NoteMapperKey } from "./note/key";
import { NoteService } from "./note/note.service";
import { NoteServiceKey } from "./note/key";

const container = new Container();

container.bind(ProjectMapperKey, ProjectMapper);
container.bind(ProjectServiceKey, ProjectService);

container.bind(ShortcutMapperKey, ShortcutMapper);
container.bind(ShortcutServiceKey, ShortcutService);

container.bind(SourceMapperKey, SourceMapper);
container.bind(SourceServiceKey, SourceService);

container.bind(NoteMapperKey, NoteMapper);
container.bind(NoteServiceKey, NoteService);
export const getService = <T>(key: InjectionKey<T>): T => {
  return container.get(key);
};

export {
  ProjectServiceKey,
  ShortcutServiceKey,
  SourceServiceKey,
  NoteServiceKey,
};
