import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";

import "@/assets/style/index";
import "@/assets/iconfont/index";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import PageContainer from "@/components/page-layout/PageContainer.vue";
import PageHeader from "@/components/page-layout/PageHeader.vue";
import PageContent from "@/components/page-layout/PageContent.vue";
import PageSider from "@/components/page-layout/PageSider.vue";
import SearchBar from "@/components/search-bar/SearchBar.vue";
import SearchItem from "@/components/search-bar/SearchItem.vue";

const boostrap = () => {
  const app = createApp(App);
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app
    .use(ElementPlus)
    .use(router)
    .use(pinia)
    .component("PageContainer", PageContainer)
    .component("PageHeader", PageHeader)
    .component("PageContent", PageContent)
    .component("PageSider", PageSider)
    .component("SearchBar", SearchBar)
    .component("SearchItem", SearchItem)
    .mount("#app")
    .$nextTick(() => {
      // Use contextBridge
      window.ipcRenderer.on("main-process-message", (_event, message) => {
        console.log(message);
      });
    });
};
boostrap();
