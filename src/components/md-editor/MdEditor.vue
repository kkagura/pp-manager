<template>
  <div ref="wrapperRef"></div>
</template>

<script lang="ts" setup>
import { useSettingStore } from "@/store/setting";
import Vditor from "vditor";
import "vditor/src/assets/less/index.less";
import { ref, onMounted, shallowRef, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const wrapperRef = ref<HTMLElement | null>(null);
const editor = shallowRef<Vditor>();

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== editor.value?.getValue()) {
      editor.value?.setValue(newVal);
    }
  }
);

onMounted(() => {
  editor.value = new Vditor(wrapperRef.value!, {
    minHeight: 400,
    width: "100%",
    cache: { enable: false },
    outline: { enable: true, position: "left" },
    mode: "wysiwyg",
    customWysiwygToolbar: () => {},
    input: (value: string) => {
      emit("update:modelValue", value);
    },
    after: () => {
      setTheme();
      editor.value?.setValue(props.modelValue);
    },
  });
});

const settingStore = useSettingStore();
watch(
  () => settingStore.theme,
  () => {
    setTheme();
  }
);

const CODE_DARK_THEME = "solarized-dark256";
const CODE_LIGHT_THEME = "github";

const setTheme = () => {
  let theme: "dark" | "classic" =
    settingStore.theme === "dark" ? "dark" : "classic";
  editor.value?.setTheme(
    theme,
    settingStore.theme,
    settingStore.theme === "dark" ? CODE_DARK_THEME : CODE_LIGHT_THEME
  );
};

const getValue = () => {
  return editor.value?.getValue();
};

const setValue = (value: string) => {
  editor.value?.setValue(value);
};

defineExpose({ getValue, setValue });
</script>
<style scoped lang="less"></style>
