<template>
  <svg class="iconfont" aria-hidden="true">
    <use :xlink:href="'#' + iconName"></use>
  </svg>
</template>

<script lang="ts" setup>
defineProps<{
  iconName: string;
}>();
</script>
<style scoped lang="less">
.iconfont {
  width: 1em;
  height: 1em;
  fill: currentColor;
}
</style>
