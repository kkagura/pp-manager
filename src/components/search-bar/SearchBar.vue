<template>
  <div class="search-bar" ref="searchBarRef">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { computed, provide, ref } from "vue";
import { searchBarContextKey, SearchBarContext } from "./context";

const props = defineProps({
  labelWidth: {
    type: [String, Number],
    default: "fit-content",
  },
  gutter: {
    type: Number,
    default: 12,
  },
});

const context = computed<SearchBarContext>(() => {
  return {
    labelWidth: props.labelWidth,
    gutter: props.gutter,
  };
});

provide(searchBarContextKey, context);

const searchBarRef = ref<HTMLElement>();

useResizeObserver(searchBarRef, () => {});
</script>
<style scoped lang="less"></style>
