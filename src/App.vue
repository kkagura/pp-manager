<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <router-view></router-view>
      <el-image
        :style="{ display: 'none' }"
        :preview="{
          visible: imagePreview.visible,
          onVisibleChange: setVisible,
        }"
        :src="imagePreview.imageUrl"
      ></el-image>
    </div>
  </el-config-provider>
</template>
<script lang="ts" setup>
import { useSettingStore } from "@/store/setting";
import { watch } from "vue";
import { setTheme, setThemeColor } from "./utils/theme";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { useImagePreviewStore } from "./store/image-preview";

const setting = useSettingStore();
const imagePreview = useImagePreviewStore();

const setVisible = (visible: boolean) => {
  if (!visible) {
    imagePreview.imageUrl = "";
  }
  imagePreview.visible = visible;
};

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
