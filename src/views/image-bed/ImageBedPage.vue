<script setup lang="ts">
import PageContainer from "@/components/page-layout/PageContainer.vue";
import PageContent from "@/components/page-layout/PageContent.vue";
import PageHeader from "@/components/page-layout/PageHeader.vue";
import { Plus, Refresh } from "@element-plus/icons-vue";
import { onMounted, shallowRef } from "vue";
import ImageList from "./components/ImageList.vue";
import ImageUploadDialog from "./components/ImageUploadDialog.vue";
import { useImageBed } from "./useImageBed";

const imageBed = useImageBed();
const uploadDialogVisible = shallowRef(false);

onMounted(() => {
  imageBed.loadImages();
});
</script>

<template>
  <PageContainer class="image-bed-page">
    <PageHeader title="图床">
      <template #actions>
        <el-button
          type="primary"
          :icon="Plus"
          @click="uploadDialogVisible = true"
        >
          上传图片
        </el-button>
        <el-button
          :icon="Refresh"
          :loading="imageBed.loadingList.value"
          @click="imageBed.loadImages()"
        >
          刷新
        </el-button>
      </template>
    </PageHeader>

    <PageContent>
      <div class="image-bed-content">
        <ImageList
          :items="imageBed.imageList.value"
          :loading="imageBed.loadingList.value"
          :page="imageBed.page.value"
          :page-size="imageBed.pageSize.value"
          :total="imageBed.total.value"
          @change-page="imageBed.loadImages"
          @copy="(_format, text) => imageBed.copyText(text)"
          @remove="imageBed.deleteImage"
        />
      </div>
    </PageContent>

    <ImageUploadDialog
      v-model:visible="uploadDialogVisible"
      :uploading="imageBed.uploading.value"
      :max-size-text="imageBed.maxSizeText.value"
      :record="imageBed.latestUploaded.value"
      @upload="imageBed.uploadImage"
      @copy="(_format, text) => imageBed.copyText(text)"
    />
  </PageContainer>
</template>

<style scoped lang="less">
.image-bed-page {
  min-height: 100%;
}

.image-bed-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
