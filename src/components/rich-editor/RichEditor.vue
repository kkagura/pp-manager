<template>
  <div class="rich-editor-container">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      class="rich-editor-toolbar"
    />
    <Editor
      :modelValue="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      class="rich-editor-content"
      @onCreated="handleCreated"
      @onChange="handleChange"
      @onFocus="handleFocus"
      @onBlur="handleBlur"
    />
  </div>
</template>

<script lang="ts" setup>
import "@wangeditor/editor/dist/css/style.css"; // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
const editorRef = shallowRef();

const mode = ref("default");

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
  (e: "input", value: string): void;
  (e: "focus", editor: any): void;
  (e: "blur", editor: any): void;
}>();

const toolbarConfig = {};
const editorConfig = { placeholder: "请输入内容..." }; // 内容 HTML
const valueHtml = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== valueHtml.value) {
      valueHtml.value = newVal;
      editorRef.value?.setHtml(newVal);
    }
  }
);

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  editorRef.value?.destroy();
});

const handleCreated = (editor: any) => {
  editorRef.value = editor; //
};
const handleChange = (editor: any) => {
  const html = editor.getHtml();
  if (html !== valueHtml.value) {
    valueHtml.value = html;
    emit("update:modelValue", html);
    emit("input", html);
    emit("change", html);
  }
};
const handleFocus = (editor: any) => {
  emit("focus", editor);
};
const handleBlur = (editor: any) => {
  emit("blur", editor);
};
</script>
<style scoped lang="less">
.rich-editor-container {
  border: 1px solid var(--main-section-border-color);
  .rich-editor-toolbar {
    border-bottom: 1px solid var(--main-section-border-color);
  }
  .rich-editor-content {
    min-height: 500px;
    overflow-y: hidden;
  }
}
</style>
<style lang="less">
// https://github.com/wangeditor-team/wangEditor/blob/master/packages/editor/src/assets/index.less#L15
:root {
  --w-e-textarea-bg-color: var(--main-section-bg-color);
  --w-e-textarea-color: var(--text-color);
  --w-e-textarea-border-color: var(--main-section-border-color);

  --w-e-toolbar-color: var(--text-color);
  --w-e-toolbar-bg-color: var(--main-section-bg-color);
  --w-e-toolbar-active-color: var(--text-color);
  --w-e-toolbar-active-bg-color: var(--menu-hover-bg-color);
  --w-e-toolbar-border-color: var(--main-section-border-color);

  --w-e-modal-button-bg-color: var(--el-color-primary);
  --w-e-modal-button-border-color: var(--el-color-primary);
}
html.dark {
  --w-e-textarea-slight-color: #b9b9b9;
  --w-e-textarea-slight-bg-color: #24292e;
}
</style>
