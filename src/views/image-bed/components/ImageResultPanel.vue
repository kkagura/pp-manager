<script setup lang="ts">
import { CopyDocument, Link, PictureRounded } from "@element-plus/icons-vue";
import type { CopyFormat, ImageBedRecord } from "../useImageBed";

defineProps<{
  record: ImageBedRecord | null;
}>();

const emit = defineEmits<{
  copy: [format: CopyFormat, text: string];
}>();
</script>

<template>
  <section class="result-panel">
    <div class="panel-heading">
      <div class="heading-icon">
        <el-icon>
          <Link />
        </el-icon>
      </div>
      <div class="heading-text">
        <div class="heading-title">上传结果</div>
        <div class="heading-meta">直链 / Markdown / HTML</div>
      </div>
    </div>

    <div v-if="record" class="result-content">
      <el-image
        class="result-preview"
        :src="record.displayUrl"
        :preview-src-list="[record.displayUrl]"
        fit="cover"
      />
      <div class="result-info">
        <div class="file-name" :title="record.originalName">
          {{ record.originalName }}
        </div>
        <div class="file-meta">{{ record.mimeType }} · {{ record.sizeText }}</div>
      </div>

      <div class="link-list">
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

    <el-empty v-else class="result-empty" :image-size="76" description="暂无上传结果">
      <template #image>
        <el-icon class="empty-icon">
          <PictureRounded />
        </el-icon>
      </template>
    </el-empty>
  </section>
</template>

<style scoped lang="less">
.result-panel {
  min-width: 360px;
  flex: 1;
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
  color: #7a4d1f;
  background: rgba(122, 77, 31, 0.12);
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

.result-content {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.result-preview {
  width: 180px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
}

.result-info {
  min-width: 0;
}

.file-name {
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.link-list {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-empty {
  height: 244px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.empty-icon {
  font-size: 54px;
  color: var(--el-text-color-placeholder);
}

@media (max-width: 820px) {
  .result-content {
    grid-template-columns: 1fr;
  }

  .result-preview {
    width: 100%;
    height: 220px;
  }
}
</style>
