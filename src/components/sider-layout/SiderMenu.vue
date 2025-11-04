<template>
  <div class="sider-menu-container">
    <div class="menu-list">
      <div
        class="menu-item"
        :class="{ 'is-active': isMenuActive(menu) }"
        :title="menu.meta.title"
        v-for="menu in menus"
        :key="menu.path"
        @click="handleMenuClick(menu)"
      >
        <template v-if="menu.meta?.icon">
          <Iconfont :icon-name="menu.meta.icon"></Iconfont>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { siderRoutes } from "@/router";
import Iconfont from "../iconfont/Iconfont.vue";
import { useRoute, useRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { computed } from "vue";

const menus = siderRoutes.filter(
  (menu) => menu.meta && menu.meta.menu === true
);

const router = useRouter();
const route = useRoute();
const handleMenuClick = (menu: RouteRecordRaw) => {
  router.push(menu.path);
};
const isMenuActive = (menu: RouteRecordRaw) => {
  if (route.meta?.activeMenu === menu.name) return true;
  if (route.name === menu.name) return true;
  return false;
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
      &.is-active {
        background-color: var(--menu-hover-bg-color);
      }
    }
  }
}
</style>
