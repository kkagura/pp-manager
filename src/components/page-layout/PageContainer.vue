<template>
  <div
    class="page-container"
    :class="['is-' + direction]"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from "vue";

const props = defineProps({
  direction: {
    type: String as PropType<"vertical" | "horizontal">,
    default: "vertical",
  },
  padding: {
    type: Number,
    default: 12,
  },
});

const emit = defineEmits<{
  (
    e: "fileDrop",
    data: {
      filePath: string;
      isDirectory: boolean;
      realPath: string;
      isLink: boolean;
    }
  ): void;
}>();

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
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
      emit("fileDrop", fileInfo);
    }
  } catch (error) {
    console.error("检查路径失败:", error);
  }
};

const stylePadding = computed(() => `${props.padding}px`);
</script>
<style scoped lang="less">
.page-container {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  padding: v-bind(stylePadding);
  box-sizing: border-box;
  transition: background-color 0.2s;
  &.is-vertical {
    flex-direction: column;
  }
  &.is-horizontal {
    flex-direction: row;
  }
}
</style>
