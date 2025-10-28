<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>
<script lang="ts" setup>
import { useSettingStore } from "@/store/setting";
import { watch } from "vue";
import { setTheme, setThemeColor } from "./utils/theme";

const setting = useSettingStore();

watch(
  [() => setting.theme, () => setting.themeColor],
  (newVal) => {
    setTheme(newVal[0]);
    setThemeColor(newVal[1], newVal[0] === "dark");
  },
  {
    immediate: true,
  }
);
console.log(window.ipcRenderer)
</script>
<style scoped lang="less">
.app-container {
  width: 100vw;
  height: 100vh;
}
</style>
