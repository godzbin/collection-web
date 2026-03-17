<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>系统登录</span>
        </div>
      </template>

      <el-form
          :model="loginForm"
          :rules="rules"
          ref="loginFormRef"
          label-width="0"
          size="large"
      >
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              class="w-100"
              :loading="loading"
              @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import {login, LoginParams} from "../api/login.ts";
import {useRoute, useRouter} from "vue-router";
import {setToken} from "../utils/auth.ts";
// 假设您已全局注册图标，若未注册需单独引入 ElIcon, User, Lock 等组件

// 定义表单引用
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

// 定义表单数据，符合 LoginParams 结构
const loginForm = reactive<LoginParams>({
  username: '',
  password: ''
});

// 定义验证规则
const rules = reactive<FormRules<LoginParams>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    // { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    // { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
});

const route = useRoute()
const router = useRouter()
// 处理登录逻辑
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    // 1. 直接使用 await 等待验证结果，成功则继续，失败则抛出异常
    await loginFormRef.value.validate();

    // 2. 验证通过，执行登录逻辑
    loading.value = true;

    const res = await login(loginForm);

    loading.value = false;

    const { accessToken } = res;
    setToken(accessToken);

    const redirect = route.query.redirect;
    if (redirect) {
      router.push(redirect as string);
    } else {
      router.push('/');
    }
  } catch (error) {
    // 3. 验证失败或请求出错会进入这里
    // validate 失败时 error 包含验证错误信息
    console.log('表单验证失败或登录请求出错:', error);
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 400px;
}

.card-header {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.w-100 {
  width: 100%;
}
</style>
