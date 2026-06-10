<template>
  <PageContainer :padding="0" direction="horizontal">
    <PageSider>
      <div class="project-list">
        <div
          class="project-item"
          :class="{ 'is-active': activeProject?.id === project.id }"
          v-for="project in projects"
          :key="project.id"
          @click="handleProjectClick(project)"
        >
          <div class="project-item-name">{{ project.name }}</div>
        </div>
      </div>
    </PageSider>
    <HomeComponent
      v-if="activeProject"
      :project="activeProject"
    ></HomeComponent>
  </PageContainer>
</template>

<script lang="ts" setup>
import { getService, ProjectServiceKey } from "@/modules";
import { ProjectEntity } from "@/modules/project/project.entity";
import HomeComponent from "./components/HomeComponent.vue";
import { ref } from "vue";

const projectService = getService(ProjectServiceKey);

const projects = ref<ProjectEntity[]>([]);
const activeProject = ref<ProjectEntity>();
const storageKey = "lastProjectId";
const recentKey = "recentProjectIds";

const readRecentIds = (): (string | number)[] => {
  try {
    const raw = localStorage.getItem(recentKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeRecentIds = (ids: (string | number)[]) => {
  localStorage.setItem(recentKey, JSON.stringify(ids));
};

// 按最近访问顺序重排：recentIds 中存在的项目提到最前（按 recentIds 顺序），
// 不存在的项目保持原顺序排在后面；顺带过滤掉后端已不存在的"幽灵 id"。
const sortByRecent = (
  list: ProjectEntity[],
  recentIds: (string | number)[]
): ProjectEntity[] => {
  const validIds = recentIds.filter((id) => list.some((p) => p.id === id));
  if (validIds.length === 0) return list;
  const idIndex = new Map(validIds.map((id, i) => [id, i]));
  const head: ProjectEntity[] = [];
  const tail: ProjectEntity[] = [];
  for (const p of list) {
    if (idIndex.has(p.id)) head.push(p);
    else tail.push(p);
  }
  head.sort((a, b) => idIndex.get(a.id)! - idIndex.get(b.id)!);
  return [...head, ...tail];
};

const handleProjectClick = (project: ProjectEntity) => {
  activeProject.value = project;
  // 把被点击的项目挪到最前
  projects.value = [
    project,
    ...projects.value.filter((p) => p.id !== project.id),
  ];
  // 持久化：去重后放到最前
  const recent = readRecentIds().filter((id) => id !== project.id);
  recent.unshift(project.id);
  writeRecentIds(recent);
  // 兼容旧 key
  localStorage.setItem(storageKey, JSON.stringify(project.id));
};

const onInit = () => {
  projectService.list({}).then((res) => {
    const recent = readRecentIds();
    projects.value = sortByRecent(res, recent);
    let lastProjectId: any = localStorage.getItem(storageKey);
    if (lastProjectId) {
      lastProjectId = JSON.parse(lastProjectId);
      const project = projects.value.find(
        (project) => project.id === lastProjectId
      );
      if (project) {
        handleProjectClick(project);
        return;
      }
    }
    if (projects.value.length > 0) {
      handleProjectClick(projects.value[0]);
    }
  });
};

onInit();
</script>
<style scoped lang="less">
.project-list {
  padding: 6px;
  .project-item {
    padding: 6px 12px;
    line-height: 24px;
    font-weight: 700;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 4px;
    transition: all 0.3s ease;
    &.is-active {
      background-color: var(--el-color-primary-light-9) !important;
    }
    &:hover {
      background-color: var(--main-section-bg-color-third);
    }
  }
}
</style>
