import { defineStore } from "pinia";

export const useSettingStore = defineStore("setting", {
  state: () => {
    return {
      theme: "light",
      routerTransitionName: "fade", // fade, zoom-in
      themeColor: "#1b2a47",
      shortcutKey: "CommandOrControl+Q",
    };
  },
  persist: true,
});
