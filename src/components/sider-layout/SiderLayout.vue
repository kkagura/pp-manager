<template>
  <div class="sider-layout-container">
    <div class="layout-sider">
      <SiderMenu></SiderMenu>
    </div>
    <div class="layout-main">
      <div class="layout-tabs"></div>
      <div class="layout-content">
        <router-view v-slot="{ Component }">
          <transition
            @after-enter="handleTransitionAppreared"
            :name="setting.routerTransitionName"
            mode="out-in"
          >
            <keep-alive :include="[]">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSettingStore } from "@/store/setting";
import SiderMenu from "./SiderMenu.vue";
import { callRouterTransitionCbs } from "@/utils/router-transition";

const setting = useSettingStore();

const handleTransitionAppreared = () => {
  callRouterTransitionCbs();
};
</script>
<style scoped lang="less">
.sider-layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  background-color: var(--app-bg-color);
  .layout-sider {
    height: 100%;
  }
  .layout-main {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    // .layout-tabs {}
    .layout-content {
      flex: 1;
      height: 100%;
      background-color: var(--main-section-bg-color);
    }
  }
}
</style>
