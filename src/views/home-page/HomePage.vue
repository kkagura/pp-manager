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
const handleProjectClick = (project: ProjectEntity) => {
  activeProject.value = project;
};

const onInit = () => {
  projectService.list({}).then((res) => {
    projects.value = res;
    if (res.length > 0) {
      handleProjectClick(res[0]);
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
