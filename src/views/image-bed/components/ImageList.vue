<script setup lang="ts">
import { CopyDocument, Delete, Download, Link } from "@element-plus/icons-vue";
import type { CopyFormat, ImageBedRecord } from "../useImageBed";

defineProps<{
  items: readonly ImageBedRecord[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
}>();

const emit = defineEmits<{
  changePage: [page: number];
  copy: [format: CopyFormat, text: string];
  remove: [id: number];
}>();
</script>

<template>
  <section class="image-list-section">
    <div class="section-heading">
      <div>
        <div class="section-title">全部图片</div>
        <div class="section-meta">共 {{ total }} 张，按上传时间分页展示</div>
      </div>
    </div>

    <div v-if="loading" class="image-grid">
      <el-skeleton
        v-for="index in pageSize"
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
      v-else-if="items.length === 0"
      class="list-empty"
      :image-size="88"
      description="暂无图片"
    />

    <div v-else class="image-grid">
      <article v-for="item in items" :key="item.id" class="image-card">
        <div class="image-preview-wrap">
          <el-image
            class="image-thumb"
            :src="item.displayUrl"
            :preview-src-list="[item.displayUrl]"
            fit="cover"
            lazy
          />
        </div>
        <div class="image-body">
          <div class="image-name" :title="item.originalName">
            {{ item.originalName }}
          </div>
          <div class="image-meta">{{ item.mimeType }} · {{ item.sizeText }}</div>
        </div>
        <div class="image-actions">
          <el-tooltip content="复制直链" placement="top">
            <el-button
              circle
              size="small"
              :icon="Link"
              @click="emit('copy', 'url', item.previewFullUrl)"
            />
          </el-tooltip>
          <el-tooltip content="复制 Markdown" placement="top">
            <el-button
              circle
              size="small"
              :icon="CopyDocument"
              @click="emit('copy', 'markdown', item.markdownText)"
            />
          </el-tooltip>
          <el-tooltip content="复制 HTML" placement="top">
            <el-button
              circle
              size="small"
              :icon="Download"
              @click="emit('copy', 'html', item.htmlText)"
            />
          </el-tooltip>
          <el-popconfirm
            title="确定删除这张图片吗？"
            placement="top-end"
            @confirm="emit('remove', item.id)"
          >
            <template #reference>
              <el-button circle size="small" type="danger" :icon="Delete" />
            </template>
          </el-popconfirm>
        </div>
      </article>
    </div>

    <div v-if="total > pageSize" class="pagination-bar">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        @current-change="emit('changePage', $event)"
      />
    </div>
  </section>
</template>

<style scoped lang="less">
.image-list-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
}

.section-meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.image-card {
  min-width: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  overflow: hidden;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.image-card:hover {
  border-color: rgba(31, 122, 84, 0.38);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.image-preview-wrap {
  padding: 8px 8px 0;
}

.image-thumb {
  width: 100%;
  aspect-ratio: 16 / 11;
  display: block;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  overflow: hidden;
}

.image-body {
  padding: 10px 12px 8px;
}

.image-name {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-meta {
  margin-top: 3px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.image-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px 12px;
}

.list-empty {
  min-height: 240px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding: 4px 0;
}

.image-card-skeleton {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 8px;
  box-sizing: border-box;
}

.skeleton-thumb {
  width: 100%;
  aspect-ratio: 16 / 11;
  border-radius: 6px;
}

.skeleton-body {
  padding: 10px 4px 4px;
}

.skeleton-short {
  width: 62%;
  margin-top: 6px;
}
</style>
