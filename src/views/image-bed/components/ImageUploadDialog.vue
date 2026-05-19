<script setup lang="ts">
import { CopyDocument, Picture, UploadFilled } from "@element-plus/icons-vue";
import { computed, shallowRef } from "vue";
import type { CopyFormat, ImageBedRecord } from "../useImageBed";

defineProps<{
  uploading: boolean;
  maxSizeText: string;
  record: ImageBedRecord | null;
}>();

const visible = defineModel<boolean>("visible", { required: true });

const emit = defineEmits<{
  upload: [file: File];
  copy: [format: CopyFormat, text: string];
}>();

const fileInputRef = shallowRef<HTMLInputElement | null>(null);
const isDragging = shallowRef(false);

const dropZoneClasses = computed(() => ({
  "upload-drop-zone": true,
  "is-dragging": isDragging.value,
}));

function openFilePicker(): void {
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
  uploadFirstFile(event.dataTransfer?.files ?? null);
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="上传图片"
    width="720px"
    destroy-on-close
    append-to-body
  >
    <div class="upload-dialog-body">
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
        <span class="upload-title">{{ uploading ? "上传中" : "点击或拖放图片" }}</span>
        <span class="upload-subtitle">支持 PNG / JPG / WebP / GIF / SVG，单张不超过 {{ maxSizeText }}</span>
      </button>

      <input
        ref="fileInputRef"
        class="file-input"
        type="file"
        accept="image/*,.svg"
        @change="handleFileChange"
      />

      <div v-if="record" class="result-card">
        <el-image
          class="result-preview"
          :src="record.displayUrl"
          :preview-src-list="[record.displayUrl]"
          fit="cover"
        />
        <div class="result-main">
          <div class="result-name" :title="record.originalName">
            {{ record.originalName }}
          </div>
          <div class="result-meta">{{ record.mimeType }} · {{ record.sizeText }}</div>
          <div class="copy-list">
            <el-input :model-value="record.previewFullUrl" readonly>
              <template #prepend>直链</template>
              <template #append>
                <el-button :icon="CopyDocument" @click="emit('copy', 'url', record.previewFullUrl)" />
              </template>
            </el-input>
            <el-input :model-value="record.markdownText" readonly>
              <template #prepend>MD</template>
              <template #append>
                <el-button :icon="CopyDocument" @click="emit('copy', 'markdown', record.markdownText)" />
              </template>
            </el-input>
            <el-input :model-value="record.htmlText" readonly>
              <template #prepend>HTML</template>
              <template #append>
                <el-button :icon="CopyDocument" @click="emit('copy', 'html', record.htmlText)" />
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <el-empty v-else class="upload-empty" :image-size="72" description="上传成功后会在这里生成链接">
        <template #image>
          <el-icon class="empty-icon">
            <Picture />
          </el-icon>
        </template>
      </el-empty>
    </div>
  </el-dialog>
</template>

<style scoped lang="less">
.upload-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-drop-zone {
  width: 100%;
  height: 190px;
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
    background-color 0.2s ease;
}

.upload-drop-zone:hover,
.upload-drop-zone.is-dragging {
  border-color: #1f7a54;
  background: rgba(31, 122, 84, 0.08);
}

.upload-drop-zone:disabled {
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

.result-card {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  gap: 14px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.result-preview {
  width: 170px;
  height: 170px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--el-fill-color-light);
}

.result-main {
  min-width: 0;
}

.result-name {
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.copy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.upload-empty {
  min-height: 150px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
}

.empty-icon {
  font-size: 52px;
  color: var(--el-text-color-placeholder);
}

@media (max-width: 760px) {
  .result-card {
    grid-template-columns: 1fr;
  }

  .result-preview {
    width: 100%;
    height: 220px;
  }
}
</style>
