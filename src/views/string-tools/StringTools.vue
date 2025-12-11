<template>
  <page-container class="string-tools-container">
    <page-header>字符串工具</page-header>
    <page-content>
      <el-form label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="输入值">
              <el-input v-model="inputValue" @change="handleInputChange" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单路径">
              <el-input :model-value="menuPathValue" readonly>
                <template #append>
                  <el-button @click="handleCopy(menuPathValue)">复制</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="css背景图">
              <el-input :model-value="bgUrlPathValue" readonly>
                <template #append>
                  <el-button @click="handleCopy(bgUrlPathValue)">复制</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="转小驼峰">
              <el-input :model-value="camelCaseValue" readonly>
                <template #append>
                  <el-button @click="handleCopy(camelCaseValue)"
                    >复制</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="转大驼峰">
              <el-input :model-value="pascalCaseValue" readonly>
                <template #append>
                  <el-button @click="handleCopy(pascalCaseValue)"
                    >复制</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="转中划线">
              <el-input :model-value="kebabCaseValue" readonly>
                <template #append>
                  <el-button @click="handleCopy(kebabCaseValue)"
                    >复制</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </page-content>
    <page-header>随机密码生成</page-header>
    <page-content>
      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="包含小写字母">
              <el-switch v-model="passwordConfig.includeLowercase" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="包含大写字母">
              <el-switch v-model="passwordConfig.includeUppercase" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="包含数字">
              <el-switch v-model="passwordConfig.includeNumbers" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="包含特殊字符">
              <el-switch v-model="passwordConfig.includeSpecialChars" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最小长度">
              <el-input-number
                v-model="passwordConfig.minLength"
                :min="1"
                :max="100"
                :precision="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大长度">
              <el-input-number
                v-model="passwordConfig.maxLength"
                :min="1"
                :max="100"
                :precision="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" @click="generatePassword"
                >生成密码</el-button
              >
              <el-button @click="handleCopy(generatedPassword)"
                :disabled="!generatedPassword"
                >复制密码</el-button
              >
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="生成的密码">
              <el-input
                :model-value="generatedPassword"
                disabled
                placeholder="点击生成密码按钮生成随机密码"
              >
                <template #append>
                  <el-button
                    @click="handleCopy(generatedPassword)"
                    :disabled="!generatedPassword"
                    >复制</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </page-content>
  </page-container>
</template>
<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { computed, ref } from "vue";
const inputValue = ref("");
const menuPathValue = computed(() => {
  // 移除前面的 "src\views\"
  let p = inputValue.value.replace(/^src\\views\\/, "");
  // 替换所有反斜杠为斜杠
  p = p.replace(/\\/g, "/");
  return p;
});

const bgUrlPathValue = computed(() => {
  if (!inputValue.value) return '';
  // 替换所有反斜杠为斜杠
  let p = inputValue.value.replace(/\\/g, "/");
  // 将路径起始的src替换为@符号（用正则处理）
  p = p.replace(/^src/, '@');
  return `url('${p}')`;
})

const camelCaseValue = computed(() => {
  // 将中划线和空格转换为小驼峰
  const str = inputValue.value;
  // 先处理中划线和空格，将它们后面的字符转为大写
  let result = str.replace(/[- ]([a-zA-Z])/g, (_, c) => c.toUpperCase());
  // 确保首字母是小写
  if (result.length > 0) {
    result = result.charAt(0).toLowerCase() + result.slice(1);
  }
  return result;
});

const pascalCaseValue = computed(() => {
  // 将中划线和空格转换为大驼峰（PascalCase）
  const str = inputValue.value;
  // 先处理中划线和空格，将它们后面的字符转为大写
  let result = str.replace(/[- ]([a-zA-Z])/g, (_, c) => c.toUpperCase());
  // 确保首字母是大写
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  return result;
});

const kebabCaseValue = computed(() => {
  // 将驼峰字符串转换为中划线
  const str = camelCaseValue.value;
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
});

const { copy } = useClipboard();
const handleCopy = (str: string) => {
  copy(str);
  ElMessage.success("复制成功");
};

const handleInputChange = (value: string) => {
  console.log(value);
};

// 随机密码生成相关
const passwordConfig = ref({
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSpecialChars: true,
  minLength: 12,
  maxLength: 12,
});

const generatedPassword = ref("");

const generatePassword = () => {
  // 验证至少选择一种字符类型
  if (
    !passwordConfig.value.includeLowercase &&
    !passwordConfig.value.includeUppercase &&
    !passwordConfig.value.includeNumbers &&
    !passwordConfig.value.includeSpecialChars
  ) {
    ElMessage.warning("请至少选择一种字符类型");
    return;
  }

  // 验证长度范围
  if (passwordConfig.value.minLength > passwordConfig.value.maxLength) {
    ElMessage.warning("最小长度不能大于最大长度");
    return;
  }

  // 构建字符集
  let charset = "";
  if (passwordConfig.value.includeLowercase) {
    charset += "abcdefghijklmnopqrstuvwxyz";
  }
  if (passwordConfig.value.includeUppercase) {
    charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }
  if (passwordConfig.value.includeNumbers) {
    charset += "0123456789";
  }
  if (passwordConfig.value.includeSpecialChars) {
    charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  }

  // 生成随机长度（在最小和最大长度之间）
  const length =
    Math.floor(
      Math.random() *
        (passwordConfig.value.maxLength - passwordConfig.value.minLength + 1)
    ) + passwordConfig.value.minLength;

  // 生成密码
  let password = "";
  const charsetArray = charset.split("");

  // 确保至少包含每种选中的字符类型中的一个字符
  const requiredChars: string[] = [];
  if (passwordConfig.value.includeLowercase) {
    requiredChars.push(
      "abcdefghijklmnopqrstuvwxyz"[
        Math.floor(Math.random() * 26)
      ]
    );
  }
  if (passwordConfig.value.includeUppercase) {
    requiredChars.push(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
        Math.floor(Math.random() * 26)
      ]
    );
  }
  if (passwordConfig.value.includeNumbers) {
    requiredChars.push(
      "0123456789"[Math.floor(Math.random() * 10)]
    );
  }
  if (passwordConfig.value.includeSpecialChars) {
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    requiredChars.push(
      specialChars[Math.floor(Math.random() * specialChars.length)]
    );
  }

  // 先添加必需的字符
  password = requiredChars.join("");

  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password +=
      charsetArray[Math.floor(Math.random() * charsetArray.length)];
  }

  // 打乱字符顺序
  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  generatedPassword.value = password;
  ElMessage.success("密码生成成功");
};
</script>
<style scoped lang="less">
.el-form {
  padding-right: 80px;
}
.string-tools-container {
  height: auto;
}
</style>
