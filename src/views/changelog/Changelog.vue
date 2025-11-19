<template>
  <PageContainer>
    <PageHeader title="更新日志">
      <div class="changelog-title">更新日志</div>
      <template #actions>
        <el-button link class="back-button" @click="goBack">
          <ElIcon>
            <ArrowLeft />
          </ElIcon>
          返回
        </el-button>
      </template>
    </PageHeader>
    <PageContent>
      <Changelog />
    </PageContent>
  </PageContainer>
</template>

<script lang="ts" setup>
import { ArrowLeft } from "@element-plus/icons-vue";
import { VueComponent as Changelog } from "../../../CHANGELOG.md";
import { useRouter } from "vue-router";

const router = useRouter();
const goBack = () => {
  router.back();
};
</script>
<style scoped lang="less">
.changelog-title {
  font-size: 24px;
  font-weight: bold;
}
</style>
