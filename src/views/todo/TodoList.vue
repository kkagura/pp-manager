<template>
  <PageContainer>
    <div class="todo-toolbar">
      <el-form class="todo-toolbar-form" inline>
        <el-form-item label="标题">
          <el-input
            v-model="query.title"
            placeholder="请输入标题关键词"
            clearable
            @input="debounceSearch"
            @clear="handleSearch"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="query.status"
            placeholder="全部"
            clearable
            @change="handleSearch"
            @clear="handleSearch"
            style="width: 140px"
          >
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="预计完成">
          <el-date-picker
            v-model="queryExpectedRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            clearable
            @change="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="todo-toolbar-actions">
        <el-button type="primary" @click="openCreateDialog">新增待办</el-button>
      </div>
    </div>

    <div class="todo-cards" v-loading="loading">
      <el-empty v-if="todoList.length === 0" description="暂无待办" />

      <el-row v-else :gutter="12">
        <el-col
          v-for="todo in todoList"
          :key="todo.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="6"
        >
          <el-card class="todo-card" shadow="hover" @click="openEditDialog(todo)">
            <template #header>
              <div class="todo-card-header">
                <div class="todo-card-title" :title="todo.title">
                  {{ todo.title }}
                </div>
                <el-tag size="small" :type="statusTagType(todo.status)">{{
                  statusText(todo.status)
                }}</el-tag>
              </div>
            </template>

            <div class="todo-card-body">
              <div class="todo-card-desc" :title="todo.descriptionText">
                {{ todo.descriptionText || "（无描述）" }}
              </div>
              <div class="todo-card-meta">
                <div class="todo-card-meta-item">
                  <span class="label">预计：</span>
                  <span class="value">{{
                    todo.isLongTerm ? "长期" : todo.expectedFinishAt || "-"
                  }}</span>
                </div>
                <div class="todo-card-meta-item">
                  <span class="label">实际：</span>
                  <span class="value">{{ todo.actualFinishAt || "-" }}</span>
                </div>
              </div>
            </div>

            <div class="todo-card-actions" @click.stop>
              <el-button size="small" @click="openEditDialog(todo)">编辑</el-button>
              <el-popconfirm
                title="确定删除该数据吗？"
                placement="top-end"
                @confirm="handleDelete(todo.id)"
              >
                <template #reference>
                  <el-button size="small" type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增待办' : '编辑待办'"
      width="860px"
      destroy-on-close
    >
      <el-form :model="form" label-width="96px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="状态" required>
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 200px">
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="长期有效">
          <el-switch
            v-model="form.isLongTerm"
            :active-value="1"
            :inactive-value="0"
            @change="handleFormLongTermChange"
          />
        </el-form-item>

        <el-form-item label="预计完成">
          <el-date-picker
            v-model="form.expectedFinishAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择预计完成日期"
            :disabled="!!form.isLongTerm"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="实际完成">
          <el-date-picker
            v-model="form.actualFinishAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择实际完成日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="描述">
          <RichEditor
            v-model="form.descriptionHtml"
            :border="true"
            @change="syncDescriptionText"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          保存
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script lang="ts" setup>
import { getService, TodoServiceKey } from "@/modules";
import { TodoEntity, TodoStatus } from "@/modules/todo/todo.entity";
import { onMounted, reactive, ref } from "vue";
import RichEditor from "@/components/rich-editor/RichEditor.vue";
import { debounce } from "@/utils/debounce";
import { ElMessage } from "element-plus";

const service = getService(TodoServiceKey);
const todoList = ref<TodoEntity[]>([]);
const loading = ref(false);
const saving = ref(false);

const query = reactive<{
  title: string;
  status?: TodoStatus;
}>({
  title: "",
  status: undefined,
});

const queryExpectedRange = ref<[string, string] | null>(null);

const statusOptions = [
  { label: "执行中", value: TodoStatus.Executing },
  { label: "已完成", value: TodoStatus.Completed },
  { label: "已暂停", value: TodoStatus.Paused },
  { label: "已逾期", value: TodoStatus.Overdue },
];

const statusText = (status: TodoStatus) => {
  return statusOptions.find((x) => x.value === status)?.label ?? "未知";
};

const statusTagType = (status: TodoStatus) => {
  if (status === TodoStatus.Completed) return "success";
  if (status === TodoStatus.Paused) return "warning";
  if (status === TodoStatus.Overdue) return "danger";
  return "info";
};

const buildSearchParams = () => {
  const range = queryExpectedRange.value;
  return {
    title: query.title || undefined,
    status: query.status,
    expectedFinishAtStart: range?.[0],
    expectedFinishAtEnd: range?.[1],
  };
};

const getTodoList = async () => {
  loading.value = true;
  try {
    todoList.value = await service.list(buildSearchParams());
  } finally {
    loading.value = false;
  }
};

const handleSearch = async () => {
  await getTodoList();
};

const debounceSearch = debounce(handleSearch, 300);

const handleReset = async () => {
  query.title = "";
  query.status = undefined;
  queryExpectedRange.value = null;
  await getTodoList();
};

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const editingId = ref<number | null>(null);

const form = reactive<{
  title: string;
  descriptionHtml: string;
  descriptionText: string;
  status: TodoStatus;
  expectedFinishAt: string | null;
  actualFinishAt: string | null;
  isLongTerm: number;
}>({
  title: "",
  descriptionHtml: "",
  descriptionText: "",
  status: TodoStatus.Executing,
  expectedFinishAt: null,
  actualFinishAt: null,
  isLongTerm: 0,
});

const resetForm = () => {
  form.title = "";
  form.descriptionHtml = "";
  form.descriptionText = "";
  form.status = TodoStatus.Executing;
  form.expectedFinishAt = null;
  form.actualFinishAt = null;
  form.isLongTerm = 0;
  editingId.value = null;
};

const openCreateDialog = () => {
  dialogMode.value = "create";
  resetForm();
  dialogVisible.value = true;
};

const openEditDialog = (todo: TodoEntity) => {
  dialogMode.value = "edit";
  editingId.value = todo.id;
  form.title = todo.title;
  form.descriptionHtml = todo.descriptionHtml;
  form.descriptionText = todo.descriptionText;
  form.status = todo.status;
  form.expectedFinishAt = (todo.expectedFinishAt as any) ?? null;
  form.actualFinishAt = (todo.actualFinishAt as any) ?? null;
  form.isLongTerm = todo.isLongTerm ?? 0;
  dialogVisible.value = true;
};

const handleFormLongTermChange = () => {
  if (form.isLongTerm) {
    form.expectedFinishAt = null;
  }
};

const syncDescriptionText = (editor: any) => {
  form.descriptionText = editor.getText();
};

const handleSubmit = async () => {
  if (!form.title?.trim()) {
    ElMessage.warning("请填写标题");
    return;
  }
  saving.value = true;
  try {
    if (dialogMode.value === "create") {
      await service.add({
        title: form.title.trim(),
        descriptionHtml: form.descriptionHtml ?? "",
        descriptionText: form.descriptionText ?? "",
        status: form.status,
        expectedFinishAt: form.isLongTerm ? null : form.expectedFinishAt,
        actualFinishAt: form.actualFinishAt,
        isLongTerm: form.isLongTerm,
      });
      ElMessage.success("新增成功");
    } else if (editingId.value != null) {
      await service.update({
        id: editingId.value,
        title: form.title.trim(),
        descriptionHtml: form.descriptionHtml ?? "",
        descriptionText: form.descriptionText ?? "",
        status: form.status,
        expectedFinishAt: form.isLongTerm ? null : form.expectedFinishAt,
        actualFinishAt: form.actualFinishAt,
        isLongTerm: form.isLongTerm,
      } as any);
      ElMessage.success("保存成功");
    }
    dialogVisible.value = false;
    await getTodoList();
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (id: number) => {
  await service.delete(id);
  ElMessage.success("删除成功");
  await getTodoList();
};

onMounted(async () => {
  await getTodoList();
});
</script>

<style scoped lang="less">
.todo-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: var(--main-section-bg-color);
  border-radius: 8px;
}

.todo-toolbar-form {
  flex: 1;
  min-width: 0;
}

.todo-toolbar-actions {
  flex: none;
}

.todo-cards {
  margin-top: 12px;
}

.todo-card {
  cursor: pointer;
  margin-bottom: 12px;

  :deep(.el-card__header) {
    padding: 10px 12px;
  }
  :deep(.el-card__body) {
    padding: 12px;
  }
}

.todo-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.todo-card-title {
  flex: 1;
  min-width: 0;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-card-desc {
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 18px;
  display: -webkit-box;
  word-break: break-all;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  min-height: 54px;
}

.todo-card-meta {
  margin-top: 10px;
  display: grid;
  gap: 6px;
}

.todo-card-meta-item {
  display: flex;
  gap: 6px;
  font-size: 12px;
  .label {
    color: var(--text-color-secondary);
    flex: none;
  }
  .value {
    color: var(--text-color-regular);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.todo-card-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
