<template>
  <div class="page-sider" :class="{ 'is-border': border }">
    <div class="page-sider-header">
      <slot name="header"></slot>
    </div>
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
import { computed, PropType } from "vue";

const props = defineProps({
  width: {
    type: [Number, String] as PropType<number | string>,
    default: 180,
  },
  border: {
    type: Boolean,
    default: true,
  },
});

const styleWidth = computed(() =>
  typeof props.width === "number" ? `${props.width}px` : props.width
);
</script>
<style scoped lang="less">
.page-sider {
  height: 100%;
  width: v-bind(styleWidth);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease-in-out;
  &.is-border {
    border-right: 1px solid var(--main-section-border-color);
  }
  .page-sider-content {
    flex: 1;
    overflow-y: auto;
    .page-sider-inner {
      width: v-bind(styleWidth);
      transition: width 0.3s ease-in-out;
    }
  }
}
</style>
