import { defineStore } from "pinia";

export const useImagePreviewStore = defineStore("imagePreview", {
  state: () => {
    return {
      visible: false,
      imageUrl: "",
    };
  },
});
