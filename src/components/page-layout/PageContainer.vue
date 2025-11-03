<template>
  <div
    class="page-container"
    :draggable="draggable"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  draggable: {
    type: Boolean,
    default: false,
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
</script>
<style scoped lang="less">
.page-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px;
  box-sizing: border-box;
  transition: background-color 0.2s;
}
</style>
