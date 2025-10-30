<template>
  <div class="page-content">
    <template v-if="scroll">
      <el-scrollbar>
        <slot></slot>
      </el-scrollbar>
    </template>
    <template v-else>
      <slot></slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  scroll: {
    type: Boolean,
    default: true,
  },
});
</script>
<style scoped lang="less">
.page-content {
  width: 100%;
  flex: 1;
  overflow-y: auto;
}
</style>
