<template>
  <PageContainer>
    <PageHeader>
      <SearchBar>
        <SearchItem label="项目名称">
          <el-input></el-input>
        </SearchItem>
      </SearchBar>
    </PageHeader>
  </PageContainer>
</template>

<script lang="ts" setup>
import { ProjectService } from "@/modules/project/project.service";

const projectService = new ProjectService();

projectService.list().then((projects) => {
  console.log(projects);
});
</script>
<style scoped lang="less"></style>
