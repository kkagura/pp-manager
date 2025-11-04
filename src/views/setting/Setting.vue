<template>
  <div class="page-container">
    <div class="setting-form">
      <div class="form-title">系统设置</div>
      <div class="form-section">
        <div class="form-section-title">页面设置</div>
        <div class="form-section-content">
          <div class="form-item">
            <div class="form-item-label">界面显示</div>
            <div class="form-item-content">
              <el-select v-model="setting.theme" placeholder="请选择">
                <el-option
                  v-for="option in themeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                ></el-option>
              </el-select>
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">主题色</div>
            <div class="form-item-content">
              <el-select v-model="setting.themeColor" placeholder="请选择">
                <el-option
                  v-for="option in themeColors"
                  :key="option.color"
                  :label="option.themeName"
                  :value="option.color"
                >
                  <div class="theme-color-item">
                    <span
                      class="color-block"
                      :style="{ backgroundColor: option.color }"
                    ></span>
                    <span class="color-name">{{ option.themeName }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="form-item">
            <div class="form-item-label">过渡动画</div>
            <div class="form-item-content">
              <el-select
                v-model="setting.routerTransitionName"
                placeholder="请选择"
              >
                <el-option label="淡入淡出" value="fade"></el-option>
                <el-option label="缩放" value="zoom-in"></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>
      <div class="form-section">
        <div class="form-section-title">系统设置</div>
        <div class="form-section-content">
          <div class="form-item">
            <div class="form-item-label">调试工具</div>
            <div class="form-item-content">
              <el-button type="primary" @click="openDevTools">打开调试工具</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useSettingStore } from "@/store/setting";
import { themeColors } from "@/utils/theme";

const themeOptions = ref([
  {
    label: "浅色模式",
    value: "light",
  },
  {
    label: "深色模式",
    value: "dark",
  },
]);

const setting = useSettingStore();

const openDevTools = () => {
  (window.ipcRenderer as any).openDevTools();
};
</script>
<style scoped lang="less">
.setting-form {
  width: 700px;
  margin: 0 auto;
  .form-title {
    font-size: 20px;
    font-weight: 600;
    line-height: 60px;
    margin-bottom: 10px;
  }
  .form-section {
    margin-bottom: 30px;
    .form-section-title {
      font-size: 14px;
      line-height: 20px;
      color: var(--text-color-secondary);
      margin-bottom: 10px;
    }
    .form-section-content {
      padding: 0 12px;
      background-color: var(--main-section-bg-color-secondary);
      border-radius: 4px;
      .form-item {
        line-height: 24px;
        padding: 12px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .form-item-content {
          .el-select {
            width: 200px;
          }
        }
        border-bottom: 1px solid var(--main-section-border-color);
        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}
.theme-color-item {
  display: flex;
  align-items: center;
  gap: 8px;
  .color-block {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }
  .color-name {
    font-size: 14px;
    color: var(--text-color);
  }
}
</style>
