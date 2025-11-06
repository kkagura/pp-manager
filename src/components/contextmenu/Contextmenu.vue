<template>
  <div class="contextmenu-container">
    <div @contextmenu="handleContextmenu" class="contextmenu-trigger">
      <slot></slot>
    </div>
    <Teleport to="body">
      <Transition name="contextmenu-fade">
        <div
          v-if="isPanelVisible"
          ref="contextmenuPanelRef"
          class="contextmenu-panel"
        >
          <slot name="contextmenu" :closePanel="closePanel"></slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { useClickOutside } from "@/hooks/use-click-outside";
import { ref } from "vue";

const isPanelVisible = ref(false);
const contextmenuPanelRef = ref<HTMLElement>();

const left = ref("0px");
const top = ref("0px");
const handleContextmenu = (event: MouseEvent) => {
  event.preventDefault();
  left.value = event.clientX + "px";
  top.value = event.clientY + "px";
  isPanelVisible.value = true;
};
const closePanel = () => {
  isPanelVisible.value = false;
};

useClickOutside(contextmenuPanelRef, () => {
  closePanel();
});
</script>
<style lang="less">
.contextmenu-fade-enter-active,
.contextmenu-fade-leave-active {
  transition: opacity 0.3s ease;
}
.contextmenu-fade-enter-from,
.contextmenu-fade-leave-to {
  opacity: 0;
}
.contextmenu-panel {
  position: fixed;
  left: v-bind(left);
  top: v-bind(top);
  background-color: var(--main-section-bg-color);
  border-radius: 4px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style>
