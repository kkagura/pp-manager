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
import { watch, onMounted, onBeforeUnmount } from "vue";
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

type DeepLinkPayload = {
  url: string;
  protocol: string;
  host: string;
  pathname: string;
  params: Record<string, string>;
};

const handleDeepLink = (payload: DeepLinkPayload | null) => {
  if (!payload) return;

  // 这里根据你的业务处理参数，例如根据 type / id 做路由跳转等
  // 示例：仅打印出来，方便调试
  console.log("Deep link payload:", payload);
};

// 监听运行期间通过协议唤醒的场景
const protocolOpenHandler = (_event: any, payload: DeepLinkPayload) => {
  handleDeepLink(payload);
};

onMounted(async () => {
  // 1. 启动时检查是否有通过自定义协议带来的参数
  const ipcRenderer = window.ipcRenderer as any;
  if (ipcRenderer?.getDeepLink) {
    const initialPayload =
      (await ipcRenderer.getDeepLink()) as DeepLinkPayload | null;
    handleDeepLink(initialPayload);
  }

  // 2. 应用已运行时，后续通过浏览器再次唤醒
  if (window.ipcRenderer?.on) {
    window.ipcRenderer.on("protocol-open", protocolOpenHandler);
  }
});

onBeforeUnmount(() => {
  if (window.ipcRenderer?.off) {
    window.ipcRenderer.off("protocol-open", protocolOpenHandler);
  }
});
</script>
<style scoped lang="less">
.app-container {
  width: 100vw;
  height: 100vh;
}
</style>
