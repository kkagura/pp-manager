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
      <el-form ref="formRef" :model="model" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="model.name"
            required
            :maxlength="100"
            clearable
            placeholder="请输入名称"
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
        <el-form-item label="图标" prop="icon">
          <el-input
            v-model="model.icon"
            required
            :maxlength="300"
            clearable
            placeholder="请输入图标"
          />
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
import { ShortcutServiceKey, getService } from "@/modules";
import { ShortcutCreateDto } from "@/modules/shortcut/shortcut.dto";
import { computed, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";

const shortcutService = getService(ShortcutServiceKey);

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

const model = ref<ShortcutCreateDto>({
  name: "",
  path: "",
  icon: "",
  description: "",
});

const formRef = ref<FormInstance>();
const rules = ref<FormRules>({
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  path: [{ required: true, message: "请输入路径", trigger: "blur" }],
  icon: [{ required: true, message: "请输入图标", trigger: "blur" }],
});

const handleOpen = () => {
  if (props.id !== undefined) {
    shortcutService.get(props.id).then((res) => {
      Object.assign(model.value, res);
    });
  } else {
    if (props.initialPath) {
      model.value.path = props.initialPath;
      // 自动填充名称（使用文件夹名）
      const pathParts = props.initialPath.split(/[\\/]/);
      const folderName = pathParts[pathParts.length - 1] || props.initialPath;
      // 移除文件后缀名
      const dotIndex = folderName.lastIndexOf(".");
      const displayName = dotIndex > 0 ? folderName.substring(0, dotIndex) : folderName;
      if (!model.value.name) {
        model.value.name = displayName;
      }
    }
  }
};

const handleClosed = () => {
  formRef.value?.resetFields();
};

const handleCancel = () => {
  visible.value = false;
};

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      let promise: Promise<unknown>;
      if (props.id === undefined) {
        promise = shortcutService.add(model.value);
      } else {
        promise = shortcutService.update({
          id: props.id,
          ...model.value,
        });
      }
      promise.then(() => {
        ElMessage.success("操作成功");
        visible.value = false;
        emit("success");
      });
    }
  });
};
</script>
<style scoped lang="less">
.modal-content {
  padding-right: 50px;
}
</style>
