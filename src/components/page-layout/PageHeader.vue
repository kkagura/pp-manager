<template>
  <div class="page-header">
    <div class="page-title">
      <slot>
        {{ title }}
      </slot>
    </div>
    <div class="page-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});
</script>
<style scoped lang="less">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  .page-title {
    font-size: 16px;
    font-weight: bold;
  }
  .page-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
