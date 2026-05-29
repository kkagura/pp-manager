<script lang="ts" setup>
import { computed, onMounted, reactive, ref, shallowRef, watch } from "vue";
import { ElMessage } from "element-plus";
import PageContainer from "@/components/page-layout/PageContainer.vue";
import PageContent from "@/components/page-layout/PageContent.vue";
import PageSider from "@/components/page-layout/PageSider.vue";
import { getService, SnippetServiceKey } from "@/modules";
import { SnippetEntity } from "@/modules/snippet/snippet.entity";
import { debounce } from "@/utils/debounce";
import SnippetListPanel from "./components/SnippetListPanel.vue";
import SnippetModal from "./components/SnippetModal.vue";
import SnippetPreview from "./components/SnippetPreview.vue";
import SnippetSider from "./components/SnippetSider.vue";
import {
  parseSnippetTags,
  SnippetFormPayload,
  stringifySnippetTags,
} from "./constants";

const snippetService = getService(SnippetServiceKey);
const storageKey = "lastSnippetId";

const snippets = ref<SnippetEntity[]>([]);
const allSnippets = ref<SnippetEntity[]>([]);
const activeSnippetId = shallowRef<number>();
const loading = shallowRef(false);
const modalVisible = shallowRef(false);
const editingSnippet = shallowRef<SnippetEntity>();

const searchParams = reactive({
  keyword: "",
  category: "",
  language: "",
  tag: "",
});

const activeSnippet = computed(() => {
  return snippets.value.find((snippet) => snippet.id === activeSnippetId.value);
});

const categoryOptions = computed(() => {
  return Array.from(
    new Set(allSnippets.value.map((snippet) => snippet.category).filter(Boolean))
  ).sort();
});

const languageOptions = computed(() => {
  return Array.from(
    new Set(allSnippets.value.map((snippet) => snippet.language).filter(Boolean))
  ).sort();
});

const tagOptions = computed(() => {
  return Array.from(
    new Set(
      allSnippets.value.flatMap((snippet) => parseSnippetTags(snippet.tags))
    )
  ).sort();
});

function selectSnippet(snippet: SnippetEntity) {
  activeSnippetId.value = snippet.id;
  localStorage.setItem(storageKey, JSON.stringify(snippet.id));
}

function ensureActiveSnippet() {
  if (snippets.value.length === 0) {
    activeSnippetId.value = undefined;
    return;
  }

  const matchedSnippet = snippets.value.find(
    (snippet) => snippet.id === activeSnippetId.value
  );
  if (matchedSnippet) return;

  const lastSnippetId = localStorage.getItem(storageKey);
  const lastSnippet = lastSnippetId
    ? snippets.value.find((snippet) => snippet.id === JSON.parse(lastSnippetId))
    : undefined;

  selectSnippet(lastSnippet ?? snippets.value[0]);
}

async function getSnippetList() {
  loading.value = true;
  try {
    snippets.value = await snippetService.list({
      keyword: searchParams.keyword || undefined,
      category: searchParams.category || undefined,
      language: searchParams.language || undefined,
      tag: searchParams.tag || undefined,
    });
    ensureActiveSnippet();
  } finally {
    loading.value = false;
  }
}

async function getAllSnippets() {
  allSnippets.value = await snippetService.list({});
}

async function refreshSnippets() {
  await Promise.all([getSnippetList(), getAllSnippets()]);
}

const debounceSearch = debounce(getSnippetList, 300);

watch(
  () => searchParams.keyword,
  () => {
    debounceSearch();
  }
);

watch(
  () => [searchParams.category, searchParams.language, searchParams.tag],
  () => {
    getSnippetList();
  }
);

function resetFilters() {
  searchParams.category = "";
  searchParams.language = "";
  searchParams.tag = "";
}

function openCreateModal() {
  editingSnippet.value = undefined;
  modalVisible.value = true;
}

function openEditModal(snippet: SnippetEntity) {
  editingSnippet.value = snippet;
  modalVisible.value = true;
}

async function handleSubmit(payload: SnippetFormPayload) {
  if (!payload.title) {
    ElMessage.warning("请填写标题");
    return;
  }
  if (!payload.content) {
    ElMessage.warning("请填写代码内容");
    return;
  }

  const entity = {
    title: payload.title,
    language: payload.language,
    content: payload.content,
    description: payload.description,
    category: payload.category,
    tags: stringifySnippetTags(payload.tags),
    isPinned: payload.isPinned,
  };

  if (payload.id) {
    await snippetService.update({
      id: payload.id,
      ...entity,
    });
    activeSnippetId.value = payload.id;
    ElMessage.success("保存成功");
  } else {
    const result = await snippetService.add(entity);
    activeSnippetId.value = result.id;
    ElMessage.success("新增成功");
  }

  modalVisible.value = false;
  await refreshSnippets();
}

async function handleTogglePin(snippet: SnippetEntity) {
  await snippetService.update({
    id: snippet.id,
    isPinned: snippet.isPinned ? 0 : 1,
  });
  await refreshSnippets();
}

async function handleDelete(snippet: SnippetEntity) {
  await snippetService.delete(snippet.id);
  ElMessage.success("删除成功");
  await refreshSnippets();
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

async function handleCopy(snippet: SnippetEntity) {
  await copyText(snippet.content);
  await snippetService.recordCopy(snippet.id);
  ElMessage.success("已复制");
  await refreshSnippets();
}

onMounted(async () => {
  await refreshSnippets();
});
</script>

<template>
  <PageContainer :padding="0" direction="horizontal">
    <PageSider width="220px">
      <SnippetSider
        :category-options="categoryOptions"
        :language-options="languageOptions"
        :tag-options="tagOptions"
        :active-category="searchParams.category"
        :active-language="searchParams.language"
        :active-tag="searchParams.tag"
        @update:category="searchParams.category = $event"
        @update:language="searchParams.language = $event"
        @update:tag="searchParams.tag = $event"
        @reset="resetFilters"
      />
    </PageSider>

    <SnippetListPanel
      :snippets="snippets"
      :active-id="activeSnippetId"
      :keyword="searchParams.keyword"
      :loading="loading"
      @update:keyword="searchParams.keyword = $event"
      @search="getSnippetList"
      @select="selectSnippet"
      @add="openCreateModal"
    />

    <PageContent :scroll="false">
      <SnippetPreview
        :snippet="activeSnippet"
        @copy="handleCopy"
        @edit="openEditModal"
        @delete="handleDelete"
        @toggle-pin="handleTogglePin"
      />
    </PageContent>

    <SnippetModal
      v-model:visible="modalVisible"
      :snippet="editingSnippet"
      @submit="handleSubmit"
    />
  </PageContainer>
</template>
