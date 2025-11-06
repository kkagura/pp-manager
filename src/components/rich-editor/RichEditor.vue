<template>
  <div ref="containerRef" class="rich-editor-container" :class="{ 'is-border': border }">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      class="rich-editor-toolbar"
    />
    <div class="rich-editor-content">
      <div class="rich-editor-header" v-if="showHeader">
        <input
          :value="title"
          @input="handleTitleInput"
          class="rich-editor-header-input"
          type="text"
          placeholder="请输入标题"
        />
      </div>
      <Editor
        class="rich-editor-textarea"
        :modelValue="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
        @onFocus="handleFocus"
        @onBlur="handleBlur"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import "@wangeditor/editor/dist/css/style.css"; // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { useResizeObserver } from "@/hooks/use-resize-observer";
const editorRef = shallowRef();
const containerRef = ref<HTMLElement>();

const mode = ref("default");

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  showHeader: {
    type: Boolean,
    default: false,
  },
  fitHeight: {
    type: Boolean,
    default: false,
  },
  border: {
    type: Boolean,
    default: true,
  }
});
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "update:title", value: string): void;
  (e: "change", value: string): void;
  (e: "input", value: string): void;
  (e: "focus", editor: any): void;
  (e: "blur", editor: any): void;
}>();

const textareaHeight = ref("auto");
useResizeObserver(containerRef, () => {
  if (props.fitHeight) {
    caculateTextareaHeight();
  }
});
const caculateTextareaHeight = () => {
  if (!containerRef.value) return;
  const containerHeight = containerRef.value.clientHeight;
  const toolbarHeight =
    containerRef.value.querySelector(".rich-editor-toolbar")?.clientHeight ?? 0;
  const headerHeight =
    containerRef.value.querySelector(".rich-editor-header")?.clientHeight ?? 0;
  const contentHeight = containerHeight - toolbarHeight - 2 - headerHeight;
  textareaHeight.value = `${contentHeight}px`;
};

watch(
  () => props.fitHeight,
  () => {
    if (props.fitHeight) {
      caculateTextareaHeight();
    } else {
      textareaHeight.value = "auto";
    }
  }
);

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

const title = ref(props.title);
watch(
  () => props.title,
  (newVal) => {
    if (newVal !== title.value) {
      title.value = newVal;
    }
  }
);

const toolbarConfig = {};
const editorConfig = { placeholder: "请输入内容..." }; // 内容 HTML

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  editorRef.value?.destroy();
});

const handleCreated = (editor: any) => {
  editorRef.value = editor;
  // const textDiv = 
};
const handleChange = (editor: any) => {
  const html = editor.getHtml();
  if (html !== valueHtml.value) {
    valueHtml.value = html;
    emit("update:modelValue", html);
    emit("input", editor);
    emit("change", editor);
  }
};
const handleFocus = (editor: any) => {
  emit("focus", editor);
};
const handleBlur = (editor: any) => {
  emit("blur", editor);
};
const handleTitleInput = (e: any) => {
  const value = e.target.value;
  if (value !== title.value) {
    title.value = value;
    emit("update:title", value);
  }
};
</script>
<style scoped lang="less">
.rich-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  &.is-border {
    border: 1px solid var(--main-section-border-color);
  }
  .rich-editor-toolbar {
    box-sizing: border-box;
    border-bottom: 1px solid var(--main-section-border-color);
    width: 100%;
  }
  .rich-editor-header {
    padding: 10px;
    .rich-editor-header-input {
      height: 44px;
      width: 100%;
      border: none;
      outline: none !important;
      font-size: 24px;
      font-weight: 700;
      background-color: var(--main-section-bg-color);
    }
  }
  .rich-editor-content {
    .rich-editor-textarea {
      height: v-bind(textareaHeight) !important;
      overflow: hidden;
    }
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
