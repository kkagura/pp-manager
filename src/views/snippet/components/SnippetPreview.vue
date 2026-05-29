<script lang="ts" setup>
import {
  CopyDocument,
  Delete,
  Edit,
  Star,
  StarFilled,
} from "@element-plus/icons-vue";
import CodeEditor from "@/components/code-editor/CodeEditor.vue";
import { SnippetEntity } from "@/modules/snippet/snippet.entity";
import { parseSnippetTags } from "../constants";

defineProps<{
  snippet?: SnippetEntity;
}>();

const emit = defineEmits<{
  (event: "copy", snippet: SnippetEntity): void;
  (event: "edit", snippet: SnippetEntity): void;
  (event: "delete", snippet: SnippetEntity): void;
  (event: "toggle-pin", snippet: SnippetEntity): void;
}>();
</script>

<template>
  <div class="snippet-preview">
    <el-empty v-if="!snippet" description="请选择代码片段" />

    <template v-else>
      <div class="preview-header">
        <div class="preview-title-area">
          <div class="preview-title">{{ snippet.title }}</div>
          <div class="preview-meta">
            <el-tag size="small">{{ snippet.language || "text" }}</el-tag>
            <span v-if="snippet.category">{{ snippet.category }}</span>
            <span>复制 {{ snippet.copyCount || 0 }} 次</span>
          </div>
        </div>
        <div class="preview-actions">
          <el-button
            :icon="snippet.isPinned ? StarFilled : Star"
            @click="emit('toggle-pin', snippet)"
          >
            {{ snippet.isPinned ? "取消置顶" : "置顶" }}
          </el-button>
          <el-button :icon="CopyDocument" type="primary" @click="emit('copy', snippet)">
            复制
          </el-button>
          <el-button :icon="Edit" @click="emit('edit', snippet)">编辑</el-button>
          <el-popconfirm
            title="确定删除该代码片段吗？"
            placement="top-end"
            @confirm="emit('delete', snippet)"
          >
            <template #reference>
              <el-button :icon="Delete" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>

      <div v-if="snippet.description" class="preview-description">
        {{ snippet.description }}
      </div>

      <div class="preview-tags">
        <el-tag
          v-for="tag in parseSnippetTags(snippet.tags)"
          :key="tag"
          size="small"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>

      <div class="preview-code">
        <CodeEditor
          :model-value="snippet.content"
          :language="snippet.language"
          readonly
          height="100%"
        />
      </div>
    </template>
  </div>
</template>

<style scoped lang="less">
.snippet-preview {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 14px;
  box-sizing: border-box;
}

.preview-header {
  flex: none;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.preview-title-area {
  flex: 1;
  min-width: 0;
}

.preview-title {
  font-size: 20px;
  line-height: 30px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-meta {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.preview-actions {
  flex: none;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.preview-description {
  flex: none;
  margin-top: 12px;
  color: var(--text-color-regular);
  line-height: 22px;
  word-break: break-word;
}

.preview-tags {
  flex: none;
  min-height: 24px;
  margin-top: 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.preview-code {
  flex: 1;
  min-height: 260px;
  margin-top: 12px;
}
</style>
