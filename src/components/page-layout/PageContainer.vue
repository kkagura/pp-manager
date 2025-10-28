<template>
  <div class="page-container">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup></script>
<style scoped lang="less">
.page-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px;
  box-sizing: border-box;
}
</style>
