<template>
  <PageContainer>
    <PageHeader title="新增工作区">
      <template #actions>
        <el-button type="default" @click="handleCancel">返回</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </PageHeader>
    <PageContent>
      <el-form
        class="work-space-form"
        label-width="100px"
        :model="model"
        :rules="rules"
        ref="formRef"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input
                v-model="model.name"
                :maxlength="50"
                clearable
                placeholder="请输入名称"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="简称" prop="shortName">
              <el-input
                v-model="model.shortName"
                placeholder="请输入简称"
                :maxlength="50"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="工作区信息">
              <MdEditor v-model="model.description" ref="mdEditorRef" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </PageContent>
  </PageContainer>
</template>

<script lang="ts" setup>
import { ProjectCreateDto } from "@/modules/project/project.dto";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import MdEditor from "@/components/md-editor/MdEditor.vue";
import { ElMessage, type FormInstance } from "element-plus";
import { getService } from "@/modules";
import { ProjectServiceKey } from "@/modules";

const projectService = getService(ProjectServiceKey);
const router = useRouter();
const route = useRoute();
const mdEditorRef = ref<InstanceType<typeof MdEditor>>();
const model = ref<ProjectCreateDto>({
  name: "",
  shortName: "",
  description: "",
});

const rules = {
  name: [{ required: true, message: "请输入名称" }],
  shortName: [{ required: true, message: "请输入简称" }],
};

const handleCancel = () => {
  router.back();
};

const formRef = ref<FormInstance>();
const handleSave = () => {
  formRef.value!.validate().then(() => {
    if (route.name === "WorkSpaceAdd") {
      projectService.add(model.value).then(() => {
        ElMessage.success("新增成功");
        router.back();
      });
    } else {
      projectService
        .update({
          ...model.value,
          id: +route.params.id,
        })
        .then(() => {
          ElMessage.success("编辑成功");
          router.back();
        });
    }
  });
};

const onInit = () => {
  if (route.name === "WorkSpaceEdit") {
    projectService.get(+route.params.id).then((res) => {
      Object.assign(model.value, res);
    });
  }
};

onInit();
</script>
<style scoped lang="less">
.work-space-form {
  padding-right: 50px;
}
</style>
