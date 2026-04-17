<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Key, Lock, RefreshRight, User } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { useAuthStore } from "@/store/auth";

interface LoginFormState {
  username: string;
  password: string;
  captchaCode: string;
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const submitting = shallowRef(false);
const loadingCaptcha = shallowRef(false);
const form = reactive<LoginFormState>({
  username: "",
  password: "",
  captchaCode: "",
});

const rules: FormRules<LoginFormState> = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  captchaCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
};

const captchaUrl = computed(() => {
  const svg = authStore.captcha?.captchaSvg;
  if (!svg) {
    return "";
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});

async function loadCaptcha(): Promise<void> {
  loadingCaptcha.value = true;
  try {
    await authStore.fetchCaptcha();
    form.captchaCode = "";
  } finally {
    loadingCaptcha.value = false;
  }
}

async function handleSubmit(): Promise<void> {
  const formInstance = formRef.value;
  if (!formInstance) {
    return;
  }

  const valid = await formInstance.validate().catch(() => false);
  if (!valid) {
    return;
  }

  const captchaId = authStore.captcha?.captchaId;
  if (!captchaId) {
    ElMessage.warning("验证码已失效，请重新获取");
    await loadCaptcha();
    return;
  }

  submitting.value = true;
  try {
    await authStore.login({
      username: form.username.trim(),
      password: form.password,
      captchaId,
      captchaCode: form.captchaCode.trim(),
    });
    await router.replace(resolveRedirect(route.query.redirect));
  } catch {
    await loadCaptcha();
  } finally {
    submitting.value = false;
  }
}

function resolveRedirect(redirect: unknown) {
  if (typeof redirect === "string" && redirect.startsWith("/")) {
    return redirect;
  }

  return {
    name: "HomePage",
  };
}

onMounted(() => {
  void loadCaptcha();
});
</script>

<template>
  <div class="login-page">
    <div class="login-shell">
      <section class="brand-panel">
        <p class="brand-eyebrow">PP Manager</p>
        <h1 class="brand-title">登录后访问你的工作台</h1>
        <p class="brand-copy">
          认证接口已接入 OpenAPI 文档定义，未登录状态下不能进入需要授权的页面。
        </p>
      </section>

      <section class="form-panel">
        <div class="form-header">
          <h2 class="form-title">账号登录</h2>
          <p class="form-subtitle">输入用户名、密码和验证码完成登录</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" :prefix-icon="User" placeholder="请输入用户名" />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              :prefix-icon="Lock"
              show-password
              type="password"
              placeholder="请输入密码"
              @keyup.enter="handleSubmit"
            />
          </el-form-item>

          <el-form-item label="验证码" prop="captchaCode">
            <div class="captcha-row">
              <el-input
                v-model="form.captchaCode"
                :prefix-icon="Key"
                maxlength="8"
                placeholder="请输入验证码"
                @keyup.enter="handleSubmit"
              />
              <button
                class="captcha-button"
                type="button"
                :disabled="loadingCaptcha"
                @click="loadCaptcha"
              >
                <img v-if="captchaUrl" class="captcha-image" :src="captchaUrl" alt="登录验证码" />
                <span v-else class="captcha-placeholder">
                  <el-icon><RefreshRight /></el-icon>
                </span>
              </button>
            </div>
          </el-form-item>

          <el-button
            class="submit-button"
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            登录
          </el-button>
        </el-form>
      </section>
    </div>
  </div>
</template>

<style scoped lang="less">
.login-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top left, rgba(27, 42, 71, 0.22), transparent 34%),
    radial-gradient(circle at bottom right, rgba(21, 120, 120, 0.18), transparent 30%),
    linear-gradient(135deg, #eef4ff 0%, #f7f9fc 45%, #edf6f2 100%);
}

.login-shell {
  width: min(980px, 100%);
  min-height: 620px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  overflow: hidden;
  border: 1px solid rgba(27, 42, 71, 0.08);
  border-radius: 28px;
  background-color: rgba(255, 255, 255, 0.94);
  box-shadow: 0 24px 80px rgba(27, 42, 71, 0.18);
  backdrop-filter: blur(16px);
}

.brand-panel {
  padding: 56px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #10314a;
  background:
    linear-gradient(160deg, rgba(16, 49, 74, 0.96), rgba(18, 88, 95, 0.92)),
    linear-gradient(130deg, #1b2a47, #1b8a7a);
}

.brand-eyebrow {
  margin: 0 0 16px;
  font-size: 13px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(240, 247, 255, 0.72);
}

.brand-title {
  margin: 0;
  max-width: 420px;
  font-size: 42px;
  line-height: 1.15;
  color: #f7fbff;
}

.brand-copy {
  margin: 24px 0 0;
  max-width: 420px;
  font-size: 16px;
  line-height: 1.75;
  color: rgba(235, 246, 250, 0.82);
}

.form-panel {
  padding: 56px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 28px;
}

.form-title {
  margin: 0;
  font-size: 30px;
  color: #132238;
}

.form-subtitle {
  margin: 12px 0 0;
  color: #607080;
  line-height: 1.6;
}

.captcha-row {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 12px;
}

.captcha-button {
  padding: 0;
  border: 1px solid #d8e2ee;
  border-radius: 14px;
  overflow: hidden;
  background-color: #f7fafc;
  cursor: pointer;
}

.captcha-button:disabled {
  cursor: wait;
}

.captcha-image,
.captcha-placeholder {
  width: 100%;
  height: 100%;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-image {
  object-fit: cover;
  background-color: #fff;
}

.captcha-placeholder {
  color: #5d7188;
}

.submit-button {
  width: 100%;
  height: 48px;
  margin-top: 8px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #17375f, #19746f);
}

@media (max-width: 840px) {
  .login-shell {
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .brand-panel,
  .form-panel {
    padding: 36px 24px;
  }

  .brand-title {
    font-size: 32px;
  }
}
</style>
