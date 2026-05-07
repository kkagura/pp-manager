import { fileApi, uploadFile } from "@/request";
import type { PublicStoredFile } from "@/request";
import { useClipboard } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { computed, onUnmounted, readonly, shallowRef } from "vue";

const IMAGE_BED_BIZ_TYPE = "image-bed";
const IMAGE_BED_PAGE_SIZE = 20;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export type CopyFormat = "url" | "markdown" | "html";

export interface ImageBedRecord extends PublicStoredFile {
  contentFullUrl: string;
  previewFullUrl: string;
  downloadFullUrl: string;
  displayUrl: string;
  markdownText: string;
  htmlText: string;
  sizeText: string;
}

function formatBytes(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function isImageRecord(file: PublicStoredFile): boolean {
  return file.mimeType.startsWith("image/");
}

export function useImageBed() {
  const latestUploaded = shallowRef<ImageBedRecord | null>(null);
  const imageList = shallowRef<ImageBedRecord[]>([]);
  const page = shallowRef(1);
  const total = shallowRef(0);
  const loadingList = shallowRef(false);
  const uploading = shallowRef(false);
  const objectUrlMap = new Map<number, string>();
  const { copy } = useClipboard();

  const pageSize = computed(() => IMAGE_BED_PAGE_SIZE);
  const maxSizeText = computed(() => `${MAX_IMAGE_SIZE / 1024 / 1024}MB`);

  async function resolveObjectUrl(file: PublicStoredFile): Promise<string | undefined> {
    const cachedUrl = objectUrlMap.get(file.id);
    if (cachedUrl) {
      return cachedUrl;
    }

    try {
      const blob = await fileApi.getContent(file.id, "preview");
      const objectUrl = URL.createObjectURL(blob);
      objectUrlMap.set(file.id, objectUrl);
      return objectUrl;
    } catch {
      return undefined;
    }
  }

  async function normalizeRecord(file: PublicStoredFile): Promise<ImageBedRecord> {
    const contentFullUrl = fileApi.resolveContentUrl(file.contentUrl);
    const previewFullUrl = fileApi.resolveContentUrl(file.previewUrl);
    const downloadFullUrl = fileApi.resolveContentUrl(file.downloadUrl);
    const displayUrl = (await resolveObjectUrl(file)) || previewFullUrl;
    const alt = file.originalName || `image-${file.id}`;

    return {
      ...file,
      contentFullUrl,
      previewFullUrl,
      downloadFullUrl,
      displayUrl,
      markdownText: `![${alt}](${previewFullUrl})`,
      htmlText: `<img src="${previewFullUrl}" alt="${alt}" />`,
      sizeText: formatBytes(file.size),
    };
  }

  function validateImage(file: File): boolean {
    if (!isImageFile(file)) {
      ElMessage.warning("请选择图片文件");
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      ElMessage.warning(`图片大小不能超过 ${maxSizeText.value}`);
      return false;
    }

    return true;
  }

  async function loadImages(nextPage = page.value): Promise<void> {
    loadingList.value = true;
    try {
      const result = await fileApi.list({
        page: nextPage,
        pageSize: IMAGE_BED_PAGE_SIZE,
        bizType: IMAGE_BED_BIZ_TYPE,
        status: 1,
      });

      page.value = result.pagination.page;
      total.value = result.pagination.total;
      const images = result.list.filter(isImageRecord);
      imageList.value = await Promise.all(images.map(normalizeRecord));
    } finally {
      loadingList.value = false;
    }
  }

  async function uploadImage(file: File): Promise<void> {
    if (!validateImage(file)) {
      return;
    }

    uploading.value = true;
    try {
      const uploaded = await uploadFile({
        file,
        filename: file.name,
        bizType: IMAGE_BED_BIZ_TYPE,
        isPublic: 1,
      });
      latestUploaded.value = await normalizeRecord(uploaded);
      ElMessage.success("上传成功");
      await loadImages(1);
    } finally {
      uploading.value = false;
    }
  }

  async function deleteImage(id: number): Promise<void> {
    await fileApi.delete(id);
    const objectUrl = objectUrlMap.get(id);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrlMap.delete(id);
    }
    if (latestUploaded.value?.id === id) {
      latestUploaded.value = null;
    }
    ElMessage.success("删除成功");
    await loadImages(imageList.value.length === 1 && page.value > 1 ? page.value - 1 : page.value);
  }

  async function copyText(text: string): Promise<void> {
    if (!text) {
      return;
    }
    await copy(text);
    ElMessage.success("复制成功");
  }

  onUnmounted(() => {
    objectUrlMap.forEach((url) => URL.revokeObjectURL(url));
    objectUrlMap.clear();
  });

  return {
    latestUploaded: readonly(latestUploaded),
    imageList: readonly(imageList),
    page: readonly(page),
    pageSize,
    total: readonly(total),
    loadingList: readonly(loadingList),
    uploading: readonly(uploading),
    maxSizeText,
    loadImages,
    uploadImage,
    deleteImage,
    copyText,
  };
}
