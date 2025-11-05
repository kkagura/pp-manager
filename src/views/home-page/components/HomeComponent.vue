<template>
  <PageContent>
    <PageContainer>
      <PageHeader :title="title"></PageHeader>
      <PageContent>
        <div class="source-list">
          <div
            class="source-item"
            v-for="source in sourceList"
            :key="source.id"
            @click="handleLaunchSource(source)"
          >
            <img
              class="source-icon"
              :src="source.shortcut.icon"
              alt="source-icon"
            />
            <div class="source-name">{{ source.name }}</div>
            <div class="source-description">{{ source.description }}</div>
          </div>
          <div
            @drop="handleDrop"
            @click="handleAddSource"
            class="source-item add-source-item"
          >
            <el-icon>
              <Plus />
            </el-icon>
          </div>
        </div>
        <RichEditor
          v-model="project.description"
          @input="handleEditorInput"
        ></RichEditor>
      </PageContent>
    </PageContainer>
    <HomeSourceModal
      v-model:visible="sourceModalContext.visible"
      :initialPath="sourceModalContext.initialPath"
      :initialProjectId="project.id"
      @success="getSourceList"
    ></HomeSourceModal>
  </PageContent>
</template>

<script lang="ts" setup>
import { getService, SourceServiceKey, ProjectServiceKey } from "@/modules";
import { type ProjectEntity } from "@/modules/project/project.entity";
import { SourceListRecordDto } from "@/modules/source/source.dto";
import { Plus } from "@element-plus/icons-vue";
import { computed, reactive, ref, watch, type PropType } from "vue";
import HomeSourceModal from "./HomeSourceModal.vue";
import { ElMessage } from "element-plus";
// import MdEditor from "@/components/md-editor/MdEditor.vue";
import { debounce } from "@/utils/debounce";
import RichEditor from "@/components/rich-editor/RichEditor.vue";

const sourceService = getService(SourceServiceKey);
const projectService = getService(ProjectServiceKey);
const props = defineProps({
  project: {
    type: Object as PropType<ProjectEntity>,
    required: true,
  },
});

const title = computed(() => {
  if (props.project.shortName) {
    return `${props.project.name}（${props.project.shortName}）`;
  }
  return props.project.name;
});

const sourceList = ref<SourceListRecordDto[]>([]);
const getSourceList = () => {
  sourceService
    .list({
      projectId: props.project.id,
    })
    .then((res) => {
      sourceList.value = res;
    });
};

watch(
  () => props.project.id,
  () => {
    getSourceList();
  },
  {
    immediate: true,
  }
);

const debuoundSave = debounce(() => {
  projectService.update(props.project);
}, 500);
const handleEditorInput = () => {
  debuoundSave();
};

const sourceModalContext = reactive({
  visible: false,
  initialPath: "",
});

const handleLaunchSource = (source: SourceListRecordDto) => {
  const event = {
    exe: source.shortcut.path,
    args: source.path,
  };
  ElMessage.success(`正在打开${source.name}`);
  (window.ipcRenderer as any).openSource(event);
};

const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();

  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) {
    return;
  }

  // 获取第一个拖拽的文件/文件夹路径
  // 在 Electron 中，File 对象有 path 属性
  const firstItem = files[0] as any;
  const filePath = firstItem.path;

  if (!filePath) {
    return;
  }

  // 通过 IPC 检查是否为文件夹
  try {
    const ipcRenderer = (window as any).ipcRenderer;
    if (ipcRenderer && ipcRenderer.getFileInfo) {
      const fileInfo = await ipcRenderer.getFileInfo(filePath);
      sourceModalContext.initialPath = fileInfo.realPath;
      sourceModalContext.visible = true;
    }
  } catch (error) {
    console.error("检查路径失败:", error);
  }
};

const handleAddSource = () => {
  sourceModalContext.initialPath = "";
  sourceModalContext.visible = true;
};
</script>
<style scoped lang="less">
.source-list {
  display: flex;
  gap: 16px;
  row-gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  .source-item {
    width: 140px;
    min-height: 140px;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    line-height: 22px;
    text-align: center;
    box-sizing: border-box;
    &:hover {
      background-color: var(--main-section-bg-color-secondary);
    }
    .source-icon {
      display: block;
      width: 80px;
      height: 80px;
      margin: 0 auto 4px;
    }
    .source-name,
    .source-description {
      width: 100%;
      overflow: hidden;
      word-break: break-all;
      // text-overflow: ellipsis;
      // white-space: nowrap;
    }
    &.add-source-item {
      font-size: 24px;
      display: flex;
      align-items: center;
      border: 1px dashed var(--el-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
