<script lang="ts" setup>
import { Plus, Search, StarFilled } from "@element-plus/icons-vue";
import { SnippetEntity } from "@/modules/snippet/snippet.entity";
import { parseSnippetTags } from "../constants";

defineProps<{
  snippets: SnippetEntity[];
  activeId?: number;
  keyword: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  (event: "update:keyword", value: string): void;
  (event: "search"): void;
  (event: "select", snippet: SnippetEntity): void;
  (event: "add"): void;
}>();
</script>

<template>
  <div class="snippet-list-panel">
    <div class="list-toolbar">
      <el-input
        :model-value="keyword"
        :prefix-icon="Search"
        placeholder="搜索标题、描述、代码或标签"
        clearable
        @update:model-value="emit('update:keyword', $event)"
        @keyup.enter="emit('search')"
        @clear="emit('search')"
      />
      <el-button type="primary" :icon="Plus" @click="emit('add')">
        新增
      </el-button>
    </div>

    <div class="snippet-list" v-loading="loading">
      <el-empty v-if="snippets.length === 0" description="暂无代码片段" />
      <button
        v-for="snippet in snippets"
        v-else
        :key="snippet.id"
        class="snippet-item"
        :class="{ 'is-active': activeId === snippet.id }"
        type="button"
        @click="emit('select', snippet)"
      >
        <div class="snippet-item-header">
          <div class="snippet-item-title" :title="snippet.title">
            <el-icon v-if="snippet.isPinned" class="pin-icon">
              <StarFilled />
            </el-icon>
            <span>{{ snippet.title }}</span>
          </div>
          <el-tag size="small">{{ snippet.language || "text" }}</el-tag>
        </div>
        <div class="snippet-item-desc" :title="snippet.description">
          {{ snippet.description || snippet.content }}
        </div>
        <div class="snippet-item-tags">
          <el-tag
            v-for="tag in parseSnippetTags(snippet.tags).slice(0, 3)"
            :key="tag"
            size="small"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped lang="less">
.snippet-list-panel {
  width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--main-section-border-color);
}

.list-toolbar {
  flex: none;
  display: flex;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid var(--main-section-border-color);
}

.snippet-list {
  flex: 1;
  min-height: 0;
  padding: 8px;
  overflow-y: auto;
}

.snippet-item {
  width: 100%;
  min-height: 94px;
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--text-color);
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: var(--main-section-bg-color-third);
  }

  &.is-active {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
}

.snippet-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.snippet-item-title {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.pin-icon {
  color: var(--el-color-warning);
  flex: none;
}

.snippet-item-desc {
  margin-top: 8px;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 18px;
  display: -webkit-box;
  word-break: break-all;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.snippet-item-tags {
  min-height: 22px;
  margin-top: 8px;
  display: flex;
  gap: 4px;
  overflow: hidden;
}
</style>
