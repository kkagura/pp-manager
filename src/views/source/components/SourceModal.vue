<template>
  <el-dialog
    @closed="handleClosed"
    @open="handleOpen"
    width="600px"
    destroy-on-close
    v-model="visible"
    :title="title"
  >
    <div class="modal-content">
      <el-form ref="formRef" :model="model" :rules="rules" label-width="120px">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="model.name"
            required
            :maxlength="100"
            clearable
            placeholder="请输入名称"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="model.description"
            required
            :maxlength="100"
            clearable
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input
            v-model="model.path"
            required
            :maxlength="300"
            clearable
            placeholder="请输入路径"
          />
        </el-form-item>
        <el-form-item label="所属项目" prop="projectId">
          <el-select
            v-model="model.projectId"
            clearable
            placeholder="请选择所属项目"
          >
            <el-option
              v-for="item in projectList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="快捷方式" prop="shortcutId">
          <el-select
            v-model="model.shortcutId"
            clearable
            placeholder="请选择快捷方式"
          >
            <el-option
              v-for="item in shortcutList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {
  ShortcutServiceKey,
  SourceServiceKey,
  ProjectServiceKey,
  getService,
} from "@/modules";
import { SourceCreateDto } from "@/modules/source/source.dto";
import { computed, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { ShortcutEntity } from "@/modules/shortcut/shortcut.entity";
import { ProjectEntity } from "@/modules/project/project.entity";

const shortcutService = getService(ShortcutServiceKey);
const sourceService = getService(SourceServiceKey);
const projectService = getService(ProjectServiceKey);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: Number,
  },
  initialPath: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}>();

const visible = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
});

const title = computed(() =>
  props.id === undefined ? "新增快捷方式" : "编辑快捷方式"
);

const model = ref<SourceCreateDto>({
  name: "",
  path: "",
  shortcutId: "",
  projectId: "",
  description: "",
});

const formRef = ref<FormInstance>();
const rules = ref<FormRules>({
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入描述", trigger: "blur" }],
  path: [{ required: true, message: "请输入路径", trigger: "blur" }],
  projectId: [{ required: true, message: "请选择所属项目", trigger: "blur" }],
  shortcutId: [{ required: true, message: "请选择快捷方式", trigger: "blur" }],
});

const handleOpen = () => {
  if (props.id !== undefined) {
    sourceService.get(props.id).then((res) => {
      console.log("res", res);
      Object.assign(model.value, res);
    });
  } else {
    // 新增时，如果提供了初始路径，则自动填充
    if (props.initialPath) {
      model.value.path = props.initialPath;
      // 自动填充名称（使用文件夹名）
      const pathParts = props.initialPath.split(/[\\/]/);
      const folderName = pathParts[pathParts.length - 1] || props.initialPath;
      if (!model.value.name) {
        model.value.name = folderName;
      }
    }
  }
};

const handleClosed = () => {
  formRef.value?.resetFields();
  // 重置 model
  model.value = {
    name: "",
    path: "",
    shortcutId: "",
    projectId: "",
    description: "",
  };
};

const handleCancel = () => {
  visible.value = false;
};

const shortcutList = ref<ShortcutEntity[]>([]);
const projectList = ref<ProjectEntity[]>([]);
const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      let promise: Promise<unknown>;
      if (props.id === undefined) {
        promise = sourceService.add(model.value as any);
      } else {
        promise = sourceService.update({
          id: props.id,
          ...model.value,
        } as any);
      }
      promise.then(() => {
        ElMessage.success("操作成功");
        visible.value = false;
        emit("success");
      });
    }
  });
};

const onInit = () => {
  shortcutService.list({}).then((res) => {
    shortcutList.value = res;
  });
  projectService.list({}).then((res) => {
    projectList.value = res;
  });
};

onInit();
</script>
<style scoped lang="less">
.modal-content {
  padding-right: 50px;
}
</style>
