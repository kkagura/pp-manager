<template>
  <PageContainer>
    <SearchBar @search="tableContext.search" @reset="tableContext.reset">
      <SearchItem label="项目名称">
        <el-input
          v-model="searchParams.name"
          :maxlength="20"
          placeholder="请输入项目名称"
          clearable
        ></el-input>
      </SearchItem>
      <template #actionExtra>
        <el-button @click="handleAdd" type="primary" :icon="Plus"
          >新增</el-button
        >
      </template>
    </SearchBar>
    <PageContent :scroll="false">
      <ProTable :tableContext="tableContext">
        <el-table-column
          min-width="100"
          prop="name"
          label="工作区名称"
        ></el-table-column>
        <el-table-column
          min-width="100"
          prop="shortName"
          label="简称"
        ></el-table-column>
        <el-table-column
          min-width="100"
          prop="createdAt"
          label="创建时间"
        ></el-table-column>
        <el-table-column width="140" prop="action" label="操作" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row.id)"
              >编辑</el-button
            >
            <el-popconfirm
              title="确定删除该数据吗？"
              placement="top-end"
              @confirm="handleDelete(scope.row.id)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </ProTable>
    </PageContent>
  </PageContainer>
</template>

<script lang="ts" setup>
import { ProjectServiceKey } from "@/modules/project/project.service";
import { Plus } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { getService } from "@/modules";
import ProTable from "@/components/pro-table/ProTable.vue";
import { useTable } from "@/hooks/use-table";
import { toRefs } from "vue";

const router = useRouter();
const projectService = getService(ProjectServiceKey);

const tableContext = useTable({
  fetch: projectService.page.bind(projectService),
  searchParams: {
    name: "",
  },
});

const { searchParams } = toRefs(tableContext);

const handleAdd = () => {
  router.push("/work-space/add");
};

const handleEdit = (id: number) => {
  router.push(`/work-space/edit/${id}`);
};

const handleDelete = (id: number) => {
  projectService.delete(id);
};

tableContext.search();
</script>
<style scoped lang="less"></style>
