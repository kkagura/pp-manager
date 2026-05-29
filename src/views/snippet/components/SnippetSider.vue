<script lang="ts" setup>
import { Refresh } from "@element-plus/icons-vue";

defineProps<{
  categoryOptions: string[];
  languageOptions: string[];
  tagOptions: string[];
  activeCategory: string;
  activeLanguage: string;
  activeTag: string;
}>();

const emit = defineEmits<{
  (event: "update:category", value: string): void;
  (event: "update:language", value: string): void;
  (event: "update:tag", value: string): void;
  (event: "reset"): void;
}>();
</script>

<template>
  <div class="snippet-sider">
    <div class="snippet-sider-header">
      <div class="snippet-sider-title">筛选</div>
      <el-button :icon="Refresh" link @click="emit('reset')">重置</el-button>
    </div>

    <div class="filter-section">
      <div class="filter-title">分类</div>
      <button
        class="filter-item"
        :class="{ 'is-active': !activeCategory }"
        type="button"
        @click="emit('update:category', '')"
      >
        全部分类
      </button>
      <button
        v-for="item in categoryOptions"
        :key="item"
        class="filter-item"
        :class="{ 'is-active': activeCategory === item }"
        type="button"
        @click="emit('update:category', item)"
      >
        {{ item }}
      </button>
    </div>

    <div class="filter-section">
      <div class="filter-title">语言</div>
      <button
        class="filter-item"
        :class="{ 'is-active': !activeLanguage }"
        type="button"
        @click="emit('update:language', '')"
      >
        全部语言
      </button>
      <button
        v-for="item in languageOptions"
        :key="item"
        class="filter-item"
        :class="{ 'is-active': activeLanguage === item }"
        type="button"
        @click="emit('update:language', item)"
      >
        {{ item }}
      </button>
    </div>

    <div class="filter-section">
      <div class="filter-title">标签</div>
      <button
        class="filter-item"
        :class="{ 'is-active': !activeTag }"
        type="button"
        @click="emit('update:tag', '')"
      >
        全部标签
      </button>
      <button
        v-for="item in tagOptions"
        :key="item"
        class="filter-item"
        :class="{ 'is-active': activeTag === item }"
        type="button"
        @click="emit('update:tag', item)"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="less">
.snippet-sider {
  padding: 10px;
}

.snippet-sider-header {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.snippet-sider-title {
  font-size: 14px;
  font-weight: 700;
}

.filter-section {
  margin-top: 14px;
}

.filter-title {
  margin-bottom: 6px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.filter-item {
  width: 100%;
  min-height: 30px;
  padding: 5px 8px;
  border: none;
  border-radius: 4px;
  color: var(--text-color);
  background: transparent;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background: var(--main-section-bg-color-third);
  }

  &.is-active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
</style>
