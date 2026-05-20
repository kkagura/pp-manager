<script setup lang="ts">
import { fileApi } from "@/request";
import type { PublicStoredFile } from "@/request";
import { Picture, Refresh, Search } from "@element-plus/icons-vue";
import { computed, nextTick, onBeforeUnmount, shallowRef } from "vue";

const IMAGE_BED_BIZ_TYPE = "image-bed";
const DEFAULT_PAGE_SIZE = 12;

interface ImageSelectRecord extends PublicStoredFile {
  previewFullUrl: string;
  displayUrl: string;
  sizeText: string;
}

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    buttonText?: string;
    dialogTitle?: string;
    disabled?: boolean;
    clearable?: boolean;
    pageSize?: number;
  }>(),
  {
    placeholder: "请选择图片",
    buttonText: "选择",
    dialogTitle: "选择图片",
    disabled: false,
    clearable: true,
    pageSize: DEFAULT_PAGE_SIZE,
  },
);

const model = defineModel<string>({ default: "" });

const emit = defineEmits<{
  select: [record: ImageSelectRecord];
}>();

const visible = shallowRef(false);
const loading = shallowRef(false);
const page = shallowRef(1);
const total = shallowRef(0);
const imageList = shallowRef<ImageSelectRecord[]>([]);
const objectUrlMap = new Map<number, string>();

const hasImages = computed(() => imageList.value.length > 0);
const selectedUrl = computed(() => model.value);
const normalizedPageSize = computed(() => Math.max(1, props.pageSize));

function formatBytes(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function isImageRecord(file: PublicStoredFile): boolean {
  return file.mimeType.startsWith("image/") || /\.svg$/i.test(file.originalName);
}

async function resolveDisplayUrl(file: PublicStoredFile): Promise<string> {
  const cachedUrl = objectUrlMap.get(file.id);
  if (cachedUrl) {
    return cachedUrl;
  }

  try {
    const blob = await fileApi.getContent(file.id, "preview");
    const objectUrl = URL.createObjectURL(blob);
    objectUrlMap.set(file.id, objectUrl);
    return objectUrl;
  } catch {
    return fileApi.resolveContentUrl(file.previewUrl || file.contentUrl);
  }
}

async function normalizeRecord(file: PublicStoredFile): Promise<ImageSelectRecord> {
  const previewFullUrl = fileApi.resolveContentUrl(file.previewUrl || file.contentUrl);
  const displayUrl = await resolveDisplayUrl(file);

  return {
    ...file,
    previewFullUrl,
    displayUrl,
    sizeText: formatBytes(file.size),
  };
}

async function loadImages(nextPage = page.value): Promise<void> {
  loading.value = true;
  try {
    const result = await fileApi.list({
      page: nextPage,
      pageSize: normalizedPageSize.value,
      bizType: IMAGE_BED_BIZ_TYPE,
      status: 1,
    });
    page.value = result.pagination.page;
    total.value = result.pagination.total;
    const images = result.list.filter(isImageRecord);
    imageList.value = await Promise.all(images.map(normalizeRecord));
  } finally {
    loading.value = false;
  }
}

async function openDialog(): Promise<void> {
  if (props.disabled) {
    return;
  }

  visible.value = true;
  await nextTick();
  await loadImages(1);
}

function handleSelect(record: ImageSelectRecord): void {
  model.value = record.previewFullUrl;
  emit("select", record);
  visible.value = false;
}

onBeforeUnmount(() => {
  objectUrlMap.forEach((url) => URL.revokeObjectURL(url));
  objectUrlMap.clear();
});
</script>

<template>
  <div class="image-select-input">
    <el-input
      v-model="model"
      class="image-url-input"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      readonly
    >
      <template #append>
        <el-button :icon="Search" :disabled="disabled" @click="openDialog">
          {{ buttonText }}
        </el-button>
      </template>
    </el-input>

    <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="860px"
      append-to-body
      destroy-on-close
    >
      <div class="dialog-toolbar">
        <span class="dialog-count">共 {{ total }} 张图片</span>
        <el-button :icon="Refresh" :loading="loading" @click="loadImages(page)">
          刷新
        </el-button>
      </div>

      <div v-if="loading" class="image-grid">
        <el-skeleton
          v-for="index in normalizedPageSize"
          :key="index"
          class="image-card-skeleton"
          animated
        >
          <template #template>
            <el-skeleton-item class="skeleton-thumb" variant="image" />
            <div class="skeleton-body">
              <el-skeleton-item variant="text" />
              <el-skeleton-item class="skeleton-short" variant="text" />
            </div>
          </template>
        </el-skeleton>
      </div>

      <el-empty
        v-else-if="!hasImages"
        class="image-empty"
        :image-size="80"
        description="暂无图片"
      >
        <template #image>
          <el-icon class="empty-icon">
            <Picture />
          </el-icon>
        </template>
      </el-empty>

      <div v-else class="image-grid">
        <button
          v-for="item in imageList"
          :key="item.id"
          type="button"
          class="image-card"
          :class="{ 'is-selected': selectedUrl === item.previewFullUrl }"
          @click="handleSelect(item)"
        >
          <el-image class="image-thumb" :src="item.displayUrl" fit="cover" lazy />
          <span class="image-name" :title="item.originalName">
            {{ item.originalName }}
          </span>
          <span class="image-meta">{{ item.mimeType }} · {{ item.sizeText }}</span>
        </button>
      </div>

      <div v-if="total > normalizedPageSize" class="pagination-bar">
        <el-pagination
          background
          layout="prev, pager, next"
          :current-page="page"
          :page-size="normalizedPageSize"
          :total="total"
          @current-change="loadImages"
        />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.image-select-input {
  width: 100%;
}

.image-url-input {
  width: 100%;
}

.dialog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.dialog-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px;
}

.image-card {
  min-width: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 8px;
  background: var(--el-bg-color);
  color: var(--text-color);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.image-card:hover,
.image-card.is-selected {
  border-color: #1f7a54;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.image-thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  display: block;
  border-radius: 6px;
  overflow: hidden;
  background: var(--el-fill-color-light);
}

.image-name {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-meta {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.image-empty {
  min-height: 240px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
}

.empty-icon {
  font-size: 52px;
  color: var(--el-text-color-placeholder);
}

.image-card-skeleton {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 8px;
  box-sizing: border-box;
}

.skeleton-thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 6px;
}

.skeleton-body {
  padding-top: 8px;
}

.skeleton-short {
  width: 62%;
  margin-top: 6px;
}
</style>
