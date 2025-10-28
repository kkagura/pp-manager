<template>
  <div class="page-content">
    <el-scrollbar>
      <slot></slot>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup></script>
<style scoped lang="less">
.page-content {
  flex: 1;
  overflow-y: auto;
}
</style>
