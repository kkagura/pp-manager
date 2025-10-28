<template>
  <div class="search-item">
    <div class="search-item-label" v-if="label || $slots.label">
      <slot name="label">
        <span>{{ label }}</span>
      </slot>
    </div>
    <div class="search-item-content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useSearchBarContext } from "./context";

const props = defineProps({
  label: {
    type: [String, Number],
    default: "",
  },
  labelWidth: {
    type: String,
    default: "fit-content",
  },
});

const context = useSearchBarContext();

const labelWidth = computed(() => {
  const labelWidth = props.labelWidth || context.value.labelWidth;
  return typeof labelWidth === "string" ? labelWidth : `${labelWidth}px`;
});
</script>
<style scoped lang="less">
.search-item {
  padding: 12px 0;
  line-height: 22px;
  display: flex;
  align-items: center;
  .search-item-label {
    width: v-bind(labelWidth);
    &::after {
      content: "：";
    }
  }
  .search-item-content {
    flex: 1;
  }
}
</style>
