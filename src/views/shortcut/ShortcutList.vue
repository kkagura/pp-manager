<template>
  <PageContainer @fileDrop="handleFileDrop">
    <SearchBar @search="tableContext.search" @reset="tableContext.reset">
      <SearchItem label="快捷方式名称">
        <el-input
          v-model="searchParams.name"
          :maxlength="20"
          placeholder="请输入快捷方式名称"
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
          label="快捷方式名称"
        ></el-table-column>
        <el-table-column
          min-width="100"
          prop="path"
          label="路径"
        ></el-table-column>
        <el-table-column min-width="100" prop="icon" label="图标">
          <!-- <template #default="scope">
            <el-button
              link
              type="primary"
              @click="handlePreview(scope.row.icon)"
            >
              查看
            </el-button>
          </template> -->
        </el-table-column>
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
    <ShortcutModal
      :id="formContext.id"
      :initial-path="formContext.initialPath"
      v-model:visible="formContext.visible"
      @success="tableContext.search"
    />
  </PageContainer>
</template>

<script lang="ts" setup>
import { ShortcutServiceKey } from "@/modules";
import { Plus } from "@element-plus/icons-vue";
import { getService } from "@/modules";
import ProTable from "@/components/pro-table/ProTable.vue";
import { useTable } from "@/hooks/use-table";
import { reactive, toRefs } from "vue";
import ShortcutModal from "./components/ShortcutModal.vue";
import { useImagePreviewStore } from "@/store/image-preview";

const imagePreview = useImagePreviewStore();

const shortcutService = getService(ShortcutServiceKey);

const tableContext = useTable({
  fetch: shortcutService.page.bind(shortcutService),
  searchParams: {
    name: "",
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

const handleEdit = (id: number) => {
  formContext.id = id;
  formContext.initialPath = "";
  formContext.visible = true;
};

const handlePreview = (icon: string) => {
  imagePreview.imageUrl = icon;
  imagePreview.visible = true;
};

const handleDelete = (id: number) => {
  shortcutService.delete(id).then(() => {
    tableContext.search();
  });
};

const handleFileDrop = (data: {
  filePath: string;
  isDirectory: boolean;
  realPath: string;
}) => {
  if (data.isDirectory) return;
  // 打开新增弹窗，并自动填充路径
  formContext.id = undefined;
  formContext.initialPath = data.realPath;
  formContext.visible = true;
};

tableContext.search();
</script>
<style scoped lang="less"></style>
