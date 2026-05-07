<script setup lang="ts">
import { Picture, UploadFilled } from "@element-plus/icons-vue";
import { computed, shallowRef } from "vue";

const props = defineProps<{
  uploading: boolean;
  maxSizeText: string;
}>();

const emit = defineEmits<{
  upload: [file: File];
}>();

const fileInputRef = shallowRef<HTMLInputElement | null>(null);
const isDragging = shallowRef(false);

const dropZoneClasses = computed(() => ({
  "upload-drop-zone": true,
  "is-dragging": isDragging.value,
  "is-uploading": props.uploading,
}));

function openFilePicker(): void {
  if (props.uploading) {
    return;
  }
  fileInputRef.value?.click();
}

function uploadFirstFile(fileList: FileList | null): void {
  const file = fileList?.[0];
  if (!file) {
    return;
  }
  emit("upload", file);
}

function handleFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  uploadFirstFile(input.files);
  input.value = "";
}

function handleDragEnter(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true;
}

function handleDragOver(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

function handleDragLeave(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;
}

function handleDrop(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;

  if (props.uploading) {
    return;
  }

  uploadFirstFile(event.dataTransfer?.files ?? null);
}
</script>

<template>
  <section class="upload-panel">
    <div class="panel-heading">
      <div class="heading-icon">
        <el-icon>
          <Picture />
        </el-icon>
      </div>
      <div class="heading-text">
        <div class="heading-title">图片上传</div>
        <div class="heading-meta">image/* · {{ maxSizeText }}</div>
      </div>
    </div>

    <button
      type="button"
      :class="dropZoneClasses"
      :disabled="uploading"
      @click="openFilePicker"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <el-icon class="upload-icon">
        <UploadFilled />
      </el-icon>
      <span class="upload-title">{{ uploading ? "上传中" : "拖放图片" }}</span>
      <span class="upload-subtitle">PNG / JPG / WebP / GIF</span>
    </button>

    <input
      ref="fileInputRef"
      class="file-input"
      type="file"
      accept="image/*"
      @change="handleFileChange"
    />
  </section>
</template>

<style scoped lang="less">
.upload-panel {
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.heading-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #1f7a54;
  background: rgba(31, 122, 84, 0.12);
  font-size: 18px;
}

.heading-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heading-title {
  font-size: 15px;
  font-weight: 600;
}

.heading-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.upload-drop-zone {
  height: 220px;
  width: 100%;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.upload-drop-zone:hover,
.upload-drop-zone.is-dragging {
  border-color: #1f7a54;
  background: rgba(31, 122, 84, 0.08);
}

.upload-drop-zone.is-uploading {
  cursor: wait;
  opacity: 0.72;
}

.upload-icon {
  font-size: 42px;
  color: #1f7a54;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
}

.upload-subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.file-input {
  display: none;
}
</style>
