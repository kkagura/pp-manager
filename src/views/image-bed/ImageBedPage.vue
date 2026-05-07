<script setup lang="ts">
import PageContainer from "@/components/page-layout/PageContainer.vue";
import PageContent from "@/components/page-layout/PageContent.vue";
import PageHeader from "@/components/page-layout/PageHeader.vue";
import { Refresh } from "@element-plus/icons-vue";
import { onMounted } from "vue";
import ImageList from "./components/ImageList.vue";
import ImageResultPanel from "./components/ImageResultPanel.vue";
import ImageUploadPanel from "./components/ImageUploadPanel.vue";
import { useImageBed } from "./useImageBed";

const imageBed = useImageBed();

onMounted(() => {
  imageBed.loadImages();
});
</script>

<template>
  <PageContainer class="image-bed-page">
    <PageHeader title="图床">
      <template #actions>
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
        <div class="workbench-row">
          <ImageUploadPanel
            :uploading="imageBed.uploading.value"
            :max-size-text="imageBed.maxSizeText.value"
            @upload="imageBed.uploadImage"
          />
          <ImageResultPanel
            :record="imageBed.latestUploaded.value"
            @copy="(_format, text) => imageBed.copyText(text)"
          />
        </div>

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
  </PageContainer>
</template>

<style scoped lang="less">
.image-bed-page {
  min-height: 100%;
}

.image-bed-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.workbench-row {
  display: flex;
  gap: 18px;
  align-items: stretch;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}

@media (max-width: 920px) {
  .workbench-row {
    flex-direction: column;
  }
}
</style>
