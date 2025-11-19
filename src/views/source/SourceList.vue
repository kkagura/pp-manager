<template>
  <PageContainer @fileDrop="handleFileDrop">
    <SearchBar @search="tableContext.search" @reset="tableContext.reset">
      <SearchItem label="所属项目">
        <el-select
          v-model="searchParams.projectId"
          placeholder="请选择所属项目"
        >
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </SearchItem>
      <SearchItem label="资源名称">
        <el-input
          v-model="searchParams.name"
          :maxlength="20"
          placeholder="请输入资源名称"
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
          label="资源名称"
        ></el-table-column>
        <el-table-column
          min-width="100"
          prop="description"
          label="描述"
        ></el-table-column>
        <el-table-column
          min-width="100"
          prop="path"
          label="路径"
        ></el-table-column>
        <el-table-column min-width="100" prop="projectName" label="所属项目">
        </el-table-column>
        <el-table-column min-width="100" prop="shortcut" label="快捷方式">
          <template #default="scope">
            <span>{{ scope.row.shortcut?.name }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100" prop="sort" label="排序"></el-table-column>
        <el-table-column
          min-width="100"
          prop="createdAt"
          label="创建时间"
        ></el-table-column>
        <el-table-column width="160" prop="action" label="操作" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleLaunch(scope.row)"
              >启动</el-button
            >
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
    <SourceModal
      :id="formContext.id"
      :initial-path="formContext.initialPath"
      v-model:visible="formContext.visible"
      @success="tableContext.search"
    />
  </PageContainer>
</template>

<script lang="ts" setup>
import { ProjectServiceKey, SourceServiceKey } from "@/modules";
import { Plus } from "@element-plus/icons-vue";
import { getService } from "@/modules";
import ProTable from "@/components/pro-table/ProTable.vue";
import { useTable } from "@/hooks/use-table";
import { reactive, ref, toRefs } from "vue";
import SourceModal from "./components/SourceModal.vue";
import { SourceListRecordDto } from "@/modules/source/source.dto";
import { ProjectEntity } from "@/modules/project/project.entity";

const sourceService = getService(SourceServiceKey);
const projectService = getService(ProjectServiceKey);

const tableContext = useTable({
  fetch: sourceService.page.bind(sourceService),
  searchParams: {
    name: "",
    projectId: "" as "" | number,
  },
});

const { searchParams } = toRefs(tableContext);

const formContext = reactive({
  visible: false,
  id: undefined as number | undefined,
  initialPath: "" as string,
});
const handleAdd = () => {
  formContext.id = undefined;
  formContext.initialPath = "";
  formContext.visible = true;
};

const handleLaunch = (row: SourceListRecordDto) => {
  const event = {
    exe: row.shortcut.path,
    args: row.path,
  };
  (window.ipcRenderer as any).openSource(event);
};

const handleEdit = (id: number) => {
  formContext.id = id;
  formContext.visible = true;
};

const handleDelete = (id: number) => {
  sourceService.delete(id).then(() => {
    tableContext.search();
  });
};
const handleFileDrop = (data: { filePath: string; isDirectory: boolean }) => {
  // if (!data.isDirectory) return;
  // 打开新增弹窗，并自动填充路径
  formContext.id = undefined;
  formContext.initialPath = data.filePath;
  formContext.visible = true;
};

tableContext.search();

const projectList = ref<ProjectEntity[]>([]);
projectService.list({}).then((res) => {
  projectList.value = res;
});
</script>
<style scoped lang="less"></style>
