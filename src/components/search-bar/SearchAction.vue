<template>
  <SearchItem>
    <div class="search-actions">
      <slot>
        <el-button
          v-if="showExpandButton"
          link
          @click="handleExpand"
          type="primary"
          :icon="expand ? ArrowUp : ArrowDown"
        >
          {{ expand ? "收起" : "展开" }}
        </el-button>
        <el-button @click="handleSearch" type="primary" :icon="Search">
          搜索
        </el-button>
        <el-button @click="handleReset" type="primary" :icon="Refresh">
          重置
        </el-button>
        <slot name="extra"></slot>
      </slot>
    </div>
  </SearchItem>
</template>

<script lang="ts" setup>
import { ArrowDown, ArrowUp, Search, Refresh } from "@element-plus/icons-vue";

const props = defineProps({
  showExpandButton: {
    type: Boolean,
    default: false,
  },
  expand: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "expand", expanded: boolean): void;
  (e: "search"): void;
  (e: "reset"): void;
}>();

const handleExpand = () => {
  emit("expand", !props.expand);
};

const handleSearch = () => {
  emit("search");
};

const handleReset = () => {
  emit("reset");
};
</script>
<style scoped lang="less">
.search-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
