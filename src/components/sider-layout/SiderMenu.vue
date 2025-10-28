<template>
  <div class="sider-menu-container">
    <div class="menu-list">
      <div
        class="menu-item"
        :title="menu.meta.title"
        v-for="menu in siderRoutes"
        :key="menu.path"
        @click="handleMenuClick(menu)"
      >
        <template v-if="menu.meta">
          <Iconfont :icon-name="menu.meta.icon"></Iconfont>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { siderRoutes } from "@/router";
import Iconfont from "../iconfont/Iconfont.vue";
import { useRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const router = useRouter();
const handleMenuClick = (menu: RouteRecordRaw) => {
  router.push(menu.path);
};
</script>
<style scoped lang="less">
.sider-menu-container {
  font-size: 22px;
  width: 56px;
  .menu-list {
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    .menu-item {
      margin: 0 auto;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s ease;
      color: var(--text-color);
      &:hover {
        background-color: var(--menu-hover-bg-color);
      }
    }
  }
}
</style>
