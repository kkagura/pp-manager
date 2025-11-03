<template>
  <div class="page-sider" :class="{ 'is-border': border }">
    <div class="page-sider-content">
      <el-scrollbar>
        <div class="page-sider-inner">
          <slot></slot>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

const props = defineProps({
  defaultWidth: {
    type: Number,
    default: 180,
  },
  border: {
    type: Boolean,
    default: true,
  },
});

const width = ref(props.defaultWidth);
const styleWidth = computed(() => `${width.value}px`);
</script>
<style scoped lang="less">
.page-sider {
  height: 100%;
  width: v-bind(styleWidth);
  &.is-border {
    border-right: 1px solid var(--main-section-border-color);
  }
  .page-sider-content {
    height: 100%;
    overflow-y: auto;
    .page-sider-inner {
      width: v-bind(styleWidth);
    }
  }
}
</style>
