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
        <Contextmenu v-for="note in noteList">
          <div
            class="note-item"
            :class="{ 'is-active': activeNote?.id === note.id }"
            :key="note.id"
            @click="handleNoteClick(note)"
          >
            <div class="note-item-name">
              <span class="note-item-name-title">{{ note.title }}</span>
              <el-tag
                class="note-item-name-pinned"
                v-if="note.isPinned"
                size="small"
                >已置顶</el-tag
              >
            </div>
            <div class="note-item-text">{{ note.text }}</div>
          </div>
          <template #contextmenu="{ closePanel }">
            <div class="context-menus">
              <div
                class="context-menu-item"
                @click="toggleTop(note, closePanel)"
              >
                <el-button link>{{
                  note.isPinned ? "取消置顶" : "置顶"
                }}</el-button>
              </div>
              <el-popconfirm
                title="确定删除该数据吗？"
                placement="top-end"
                @confirm="handleDelete(note.id)"
              >
                <template #reference>
                  <div class="context-menu-item">
                    <el-button link type="danger">删除</el-button>
                  </div>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </Contextmenu>
      </div>
    </PageSider>
    <PageContent
      class="note-content"
      :scroll="false"
      v-if="activeNote"
      :key="activeNote.id"
    >
      <RichEditor
        show-header
        v-model:title="activeNote.title"
        v-model="activeNote.html"
        fit-height
        :border="false"
        @change="handleNoteChange"
        @title-change="handleTitleChange"
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
import Contextmenu from "@/components/contextmenu/Contextmenu.vue";
import { ElMessage } from "element-plus";

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

const handleTitleChange = (value: string) => {
  activeNote.value!.title = value;
  debounceUpdate();
};

const handleAddNote = () => {
  service
    .add({
      title: "未命名笔记",
      html: "",
      text: "",
      isPinned: 0,
    })
    .then(async (res) => {
      await getNoteList();
      const note = noteList.value.find((note) => note.id === res.id);
      if (note) {
        handleNoteClick(note);
      }
    });
};

const handleDelete = (id: number) => {
  service.delete(id).then(async () => {
    ElMessage.success("删除成功");
    await getNoteList();
    if (activeNote.value?.id === id) {
      activeNote.value = noteList.value[0];
      if (activeNote.value) {
        handleNoteClick(activeNote.value);
      }
    }
  });
};

const toggleTop = (note: NoteEntity, closePanel: () => void) => {
  const newNote = {
    ...note,
    isPinned: note.isPinned ? 0 : 1,
  };
  service.update(newNote).then(() => {
    closePanel();
    getNoteList().then(() => {
      const note = noteList.value.find((note) => note.id === newNote.id);
      if (note) {
        handleNoteClick(note);
      }
    });
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      .note-item-name-title {
        flex: 1;
        font-weight: 700;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        word-break: break-all;
      }
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
.note-content {
  padding-bottom: 8px;
}
.context-menus {
  padding: 6px 0;
  border-radius: 4px;
  .context-menu-item {
    min-width: 110px;
    padding: 6px 12px;
    line-height: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
  }
}
</style>
