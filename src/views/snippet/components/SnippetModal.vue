<script lang="ts" setup>
import { computed, reactive, watch } from "vue";
import CodeEditor from "@/components/code-editor/CodeEditor.vue";
import { SnippetEntity } from "@/modules/snippet/snippet.entity";
import {
  parseSnippetTags,
  SnippetFormPayload,
  snippetLanguageOptions,
} from "../constants";

const props = defineProps<{
  visible: boolean;
  snippet?: SnippetEntity;
}>();

const emit = defineEmits<{
  (event: "update:visible", value: boolean): void;
  (event: "submit", value: SnippetFormPayload): void;
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit("update:visible", value),
});

const form = reactive<SnippetFormPayload>({
  title: "",
  language: "typescript",
  content: "",
  description: "",
  category: "",
  tags: [],
  isPinned: 0,
});

const dialogTitle = computed(() => (props.snippet ? "编辑代码片段" : "新增代码片段"));

function resetForm() {
  form.id = props.snippet?.id;
  form.title = props.snippet?.title ?? "";
  form.language = props.snippet?.language ?? "typescript";
  form.content = props.snippet?.content ?? "";
  form.description = props.snippet?.description ?? "";
  form.category = props.snippet?.category ?? "";
  form.tags = parseSnippetTags(props.snippet?.tags);
  form.isPinned = props.snippet?.isPinned ?? 0;
}

watch(
  () => [props.visible, props.snippet?.id],
  () => {
    if (props.visible) {
      resetForm();
    }
  },
  { immediate: true }
);

function handleSubmit() {
  emit("submit", {
    ...form,
    title: form.title.trim(),
    category: form.category.trim(),
    description: form.description.trim(),
    tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
  });
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="920px"
    destroy-on-close
  >
    <el-form :model="form" label-width="88px">
      <el-form-item label="标题" required>
        <el-input v-model="form.title" placeholder="例如：Vue 防抖搜索" />
      </el-form-item>

      <el-form-item label="语言" required>
        <el-select v-model="form.language" filterable style="width: 240px">
          <el-option
            v-for="option in snippetLanguageOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="分类">
        <el-input v-model="form.category" placeholder="例如：前端、数据库、脚本" />
      </el-form-item>

      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="输入后回车创建标签"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="简要说明这个片段解决什么问题"
        />
      </el-form-item>

      <el-form-item label="置顶">
        <el-switch v-model="form.isPinned" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <el-form-item label="代码" required>
        <CodeEditor
          v-model="form.content"
          :language="form.language"
          placeholder="请输入代码"
          height="420px"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>
