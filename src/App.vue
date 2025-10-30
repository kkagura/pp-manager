<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <router-view></router-view>
    </div>
  </el-config-provider>
</template>
<script lang="ts" setup>
import { useSettingStore } from "@/store/setting";
import { watch } from "vue";
import { setTheme, setThemeColor } from "./utils/theme";
import zhCn from "element-plus/es/locale/lang/zh-cn";

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
console.log(window.ipcRenderer);
</script>
<style scoped lang="less">
.app-container {
  width: 100vw;
  height: 100vh;
}
</style>
