import { InjectionKey } from "@/di";
import type { ProjectService } from "./project.service";
import type { ProjectMapper } from "./project.mapper";

export const ProjectMapperKey: InjectionKey<ProjectMapper> =
  Symbol("ProjectMapper");
export const ProjectServiceKey: InjectionKey<ProjectService> =
  Symbol("ProjectService");
