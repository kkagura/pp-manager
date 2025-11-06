<template>
  <PageContainer :padding="0" direction="horizontal">
    <PageSider :border="!isFold" :width="siderWidth">
      <template #header>
        <div class="sider-header">
          <el-icon v-if="!isFold" @click="toggleFold"><Fold /></el-icon>
          <el-icon v-else @click="toggleFold"><Expand /></el-icon>
          <el-icon v-show="!isFold" @click="handleAddNote"><Plus /></el-icon>
        </div>
      </template>
      <div v-show="!isFold" class="note-list">
        <div
          class="note-item"
          :class="{ 'is-active': activeNote?.id === note.id }"
          v-for="note in noteList"
          :key="note.id"
          @click="handleNoteClick(note)"
        >
          <div class="note-item-name">{{ note.title }}</div>
          <div class="note-item-text">{{ note.text }}</div>
        </div>
      </div>
    </PageSider>
    <PageContent :scroll="false" v-if="activeNote" :key="activeNote.id">
      <RichEditor
        show-header
        v-model:title="activeNote.title"
        v-model="activeNote.html"
        fit-height
        :border="false"
        @change="handleNoteChange"
      ></RichEditor>
    </PageContent>
  </PageContainer>
</template>

<script lang="ts" setup>
import { getService, NoteServiceKey } from "@/modules";
import { NoteEntity } from "@/modules/note/note.entity";
import { Fold, Expand, Plus } from "@element-plus/icons-vue";
import { onMounted, ref } from "vue";
import RichEditor from "@/components/rich-editor/RichEditor.vue";
import { debounce } from "@/utils/debounce";

const service = getService(NoteServiceKey);
const noteList = ref<NoteEntity[]>([]);
const activeNote = ref<NoteEntity>();
const siderWidth = ref(240);
const isFold = ref(false);

const toggleFold = () => {
  isFold.value = !isFold.value;
  siderWidth.value = isFold.value ? 32 : 240;
};

const storageKey = "lastNoteId";
const handleNoteClick = (note: NoteEntity) => {
  localStorage.setItem(storageKey, JSON.stringify(note.id));
  activeNote.value = note;
};

const debounceUpdate = debounce(() => {
  service.update(activeNote.value!);
}, 500);
const handleNoteChange = (editor: any) => {
  const text = editor.getText();
  activeNote.value!.text = text;
  debounceUpdate();
};

const handleAddNote = () => {
  service
    .add({
      title: "未命名笔记",
      html: "",
      text: "",
    })
    .then(async (res) => {
      await getNoteList();
      const note = noteList.value.find((note) => note.id === res.id);
      if (note) {
        handleNoteClick(note);
      }
    });
};

const getNoteList = async () => {
  noteList.value = await service.list({});
};

onMounted(async () => {
  await getNoteList();
  const lastNoteId = localStorage.getItem(storageKey);
  if (lastNoteId) {
    activeNote.value = noteList.value.find(
      (note) => note.id === JSON.parse(lastNoteId)
    );
  }
  if (!activeNote.value && noteList.value.length > 0) {
    handleNoteClick(noteList.value[0]);
  }
});
</script>
<style scoped lang="less">
.sider-header {
  height: 32px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.note-list {
  padding: 6px;
  .note-item {
    padding: 6px 12px;
    line-height: 24px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 4px;
    transition: all 0.3s ease;
    &.is-active {
      background-color: var(--el-color-primary-light-9) !important;
    }
    &:hover {
      background-color: var(--main-section-bg-color-third);
    }
    .note-item-name {
      font-size: 14px;
      font-weight: 700;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      word-break: break-all;
    }
    .note-item-text {
      color: var(--text-color-secondary);
      font-size: 12px;
      display: -webkit-box;
      word-break: break-all;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
    }
  }
}
</style>
