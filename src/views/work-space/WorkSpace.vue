<template>
  <PageContainer>
    <PageHeader>
      <SearchBar @search="handleSearch" @reset="handleReset">
        <SearchItem label="项目名称">
          <el-input
            v-model="searchParams.name"
            :maxlength="20"
            placeholder="请输入项目名称"
            clearable
          ></el-input>
        </SearchItem>
        <template #actionExtra>
          <el-button type="primary" :icon="Plus">新增</el-button>
        </template>
      </SearchBar>
    </PageHeader>
    <PageContent></PageContent>
  </PageContainer>
</template>

<script lang="ts" setup>
import { ProjectService } from "@/modules/project/project.service";
import { ProjectListSearchDto } from "@/modules/project/project.dto";
import { ref } from "vue";
import { Plus } from "@element-plus/icons-vue";

const projectService = new ProjectService();

const searchParams = ref<ProjectListSearchDto>({
  name: "",
});

const handleReset = () => {
  searchParams.value = {
    name: "",
  };
};

const handleSearch = () => {
  projectService.list(searchParams.value).then((projects) => {
    console.log(projects);
  });
};
</script>
<style scoped lang="less"></style>
