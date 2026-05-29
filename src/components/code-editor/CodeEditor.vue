<script lang="ts" setup>
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { vue } from "@codemirror/lang-vue";
import { StreamLanguage, indentUnit } from "@codemirror/language";
import { shell as shellLanguage } from "@codemirror/legacy-modes/mode/shell";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  placeholder as placeholderExtension,
  type ViewUpdate,
} from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";

type CodeEditorTheme = "light" | "dark";

interface CodeEditorProps {
  modelValue?: string;
  language?: string;
  readonly?: boolean;
  placeholder?: string;
  height?: string | number;
  theme?: CodeEditorTheme;
}

const props = withDefaults(defineProps<CodeEditorProps>(), {
  modelValue: "",
  language: "text",
  readonly: false,
  placeholder: "",
  height: "100%",
  theme: "light",
});

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "change", value: string): void;
  (event: "focus"): void;
  (event: "blur"): void;
}>();

const editorHostRef = shallowRef<HTMLElement>();
const editorView = shallowRef<EditorView>();

const languageCompartment = new Compartment();
const readonlyCompartment = new Compartment();
const placeholderCompartment = new Compartment();
const themeCompartment = new Compartment();

const editorHeight = computed(() => {
  return typeof props.height === "number" ? `${props.height}px` : props.height;
});

const fixedLayoutTheme = EditorView.theme({
  "&": {
    height: "100%",
    width: "100%",
    fontSize: "14px",
  },
  ".cm-scroller": {
    fontFamily:
      "Consolas, Monaco, 'Courier New', var(--el-font-family), monospace",
    lineHeight: "1.6",
  },
  ".cm-content": {
    minHeight: "100%",
    padding: "10px 0",
  },
  ".cm-line": {
    padding: "0 12px",
  },
  ".cm-gutters": {
    borderRight: "1px solid var(--main-section-border-color)",
  },
  "&.cm-focused": {
    outline: "none",
  },
});

const appLightTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--main-section-bg-color)",
      color: "var(--text-color)",
    },
    ".cm-gutters": {
      backgroundColor: "var(--main-section-bg-color-third)",
      color: "var(--text-color-secondary)",
    },
    ".cm-activeLine": {
      backgroundColor: "var(--main-section-bg-color-third)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--main-section-bg-color-third)",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--el-color-primary-light-8)",
    },
  },
  { dark: false }
);

function resolveLanguageExtension(language: string): Extension {
  const normalizedLanguage = language.trim().toLowerCase();

  switch (normalizedLanguage) {
    case "js":
    case "javascript":
      return javascript();
    case "jsx":
      return javascript({ jsx: true });
    case "ts":
    case "typescript":
      return javascript({ typescript: true });
    case "tsx":
      return javascript({ jsx: true, typescript: true });
    case "vue":
      return vue({ base: html() });
    case "html":
    case "xml":
      return html();
    case "css":
    case "less":
    case "scss":
    case "sass":
      return css();
    case "json":
      return json();
    case "sql":
    case "mysql":
    case "postgres":
    case "postgresql":
      return sql();
    case "md":
    case "markdown":
      return markdown();
    case "sh":
    case "bash":
    case "shell":
    case "powershell":
      return StreamLanguage.define(shellLanguage);
    default:
      return [];
  }
}

function createReadonlyExtensions(isReadonly: boolean): Extension[] {
  return [
    EditorState.readOnly.of(isReadonly),
    EditorView.editable.of(!isReadonly),
  ];
}

function createPlaceholderExtension(placeholder: string): Extension {
  return placeholder ? placeholderExtension(placeholder) : [];
}

function createThemeExtensions(theme: CodeEditorTheme): Extension[] {
  return theme === "dark" ? [oneDark] : [appLightTheme];
}

function dispatchDocumentChange(value: string) {
  const view = editorView.value;
  if (!view) return;

  const currentValue = view.state.doc.toString();
  if (currentValue === value) return;

  view.dispatch({
    changes: {
      from: 0,
      to: currentValue.length,
      insert: value,
    },
  });
}

function createEditorView(parent: HTMLElement) {
  editorView.value = new EditorView({
    parent,
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        basicSetup,
        indentUnit.of("  "),
        fixedLayoutTheme,
        languageCompartment.of(resolveLanguageExtension(props.language)),
        readonlyCompartment.of(createReadonlyExtensions(props.readonly)),
        placeholderCompartment.of(
          createPlaceholderExtension(props.placeholder)
        ),
        themeCompartment.of(createThemeExtensions(props.theme)),
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (!update.docChanged) return;

          const value = update.state.doc.toString();
          if (value === props.modelValue) return;

          emit("update:modelValue", value);
          emit("change", value);
        }),
        EditorView.domEventHandlers({
          focus: () => {
            emit("focus");
          },
          blur: () => {
            emit("blur");
          },
        }),
      ],
    }),
  });
}

watch(
  () => props.modelValue,
  (value) => {
    dispatchDocumentChange(value);
  }
);

watch(
  () => props.language,
  (language) => {
    editorView.value?.dispatch({
      effects: languageCompartment.reconfigure(
        resolveLanguageExtension(language)
      ),
    });
  }
);

watch(
  () => props.readonly,
  (isReadonly) => {
    editorView.value?.dispatch({
      effects: readonlyCompartment.reconfigure(
        createReadonlyExtensions(isReadonly)
      ),
    });
  }
);

watch(
  () => props.placeholder,
  (placeholder) => {
    editorView.value?.dispatch({
      effects: placeholderCompartment.reconfigure(
        createPlaceholderExtension(placeholder)
      ),
    });
  }
);

watch(
  () => props.theme,
  (theme) => {
    editorView.value?.dispatch({
      effects: themeCompartment.reconfigure(createThemeExtensions(theme)),
    });
  }
);

onMounted(() => {
  if (editorHostRef.value) {
    createEditorView(editorHostRef.value);
  }
});

onBeforeUnmount(() => {
  editorView.value?.destroy();
});

function focus() {
  editorView.value?.focus();
}

function getValue() {
  return editorView.value?.state.doc.toString() ?? "";
}

function setValue(value: string) {
  dispatchDocumentChange(value);
}

defineExpose({
  focus,
  getValue,
  setValue,
});
</script>

<template>
  <div
    class="code-editor"
    :class="{ 'is-readonly': props.readonly }"
    :style="{ height: editorHeight }"
  >
    <div ref="editorHostRef" class="code-editor-host"></div>
  </div>
</template>

<style scoped lang="less">
.code-editor {
  width: 100%;
  min-height: 120px;
  border: 1px solid var(--main-section-border-color);
  border-radius: 4px;
  background-color: var(--main-section-bg-color);
  overflow: hidden;
  box-sizing: border-box;

  &.is-readonly {
    :deep(.cm-cursor) {
      display: none;
    }
  }
}

.code-editor-host {
  width: 100%;
  height: 100%;
}
</style>
