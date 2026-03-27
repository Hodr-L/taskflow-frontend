<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">{{ appName }}</h1>
        <p class="login-subtitle">娆㈣繋鍥炴潵锛岃鐧诲綍鎮ㄧ殑璐︽埛</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="璇疯緭鍏ラ偖绠?
            size="large"
            :prefix-icon="Message"
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="璇疯緭鍏ュ瘑鐮?
            size="large"
            :prefix-icon="Lock"
            autocomplete="current-password"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberMe">璁颁綇鎴?/el-checkbox>
            <router-link to="/forgot-password" class="forgot-password"> 蹇樿瀵嗙爜锛?</router-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '鐧诲綍涓?..' : '鐧诲綍' }}
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <p class="register-link">
            杩樻病鏈夎处鎴凤紵
            <router-link to="/register" class="register-button"> 绔嬪嵆娉ㄥ唽 </router-link>
          </p>
        </div>
      </el-form>

      <!-- 閿欒鎻愮ず -->
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        :closable="true"
        @close="errorMessage = ''"
        class="error-alert"
      />
    </div>

    <div class="login-footer-info">
      <p>漏 2026 {{ appName }}. All rights reserved.</p>
      <p>Version {{ appVersion }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 搴旂敤淇℃伅
const appName = import.meta.env.VITE_APP_NAME
const appVersion = import.meta.env.VITE_APP_VERSION

// 琛ㄥ崟鏁版嵁
const loginForm = reactive({
  email: '',
  password: '',
})

const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// 琛ㄥ崟楠岃瘉瑙勫垯
const loginRules = {
  email: [
    { required: true, message: '璇疯緭鍏ラ偖绠卞湴鍧€', trigger: 'blur' },
    { type: 'email', message: '璇疯緭鍏ユ纭殑閭鍦板潃', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '璇疯緭鍏ュ瘑鐮?, trigger: 'blur' },
    { min: 6, message: '瀵嗙爜闀垮害涓嶈兘灏戜簬6涓瓧绗?, trigger: 'blur' },
  ],
}

// 澶勭悊鐧诲綍
const handleLogin = async () => {
  if (loading.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.userLogin(loginForm.email, loginForm.password)

    if (result.success) {
      ElMessage.success('鐧诲綍鎴愬姛')
      router.push('/dashboard')
    } else {
      errorMessage.value = result.error || '鐧诲綍澶辫触'
    }
  } catch (error: any) {
    errorMessage.value = error.message || '鐧诲綍澶辫触锛岃妫€鏌ョ綉缁滆繛鎺?
  } finally {
    loading.value = false
  }
}

// 浠庢湰鍦板瓨鍌ㄦ仮澶嶈浣忕殑鐧诲綍淇℃伅
const loadRememberedCredentials = () => {
  if (localStorage.getItem('rememberMe') === 'true') {
    const savedEmail = localStorage.getItem('savedEmail')
    const savedPassword = localStorage.getItem('savedPassword')

    if (savedEmail) loginForm.email = savedEmail
    if (savedPassword) loginForm.password = savedPassword
    rememberMe.value = true
  }
}

// 淇濆瓨鐧诲綍淇℃伅锛堟殏鏃舵敞閲婃帀锛屽洜涓烘湭浣跨敤锛?// const saveCredentials = () => {
//   if (rememberMe.value) {
//     localStorage.setItem('rememberMe', 'true')
//     localStorage.setItem('savedEmail', loginForm.email)
//     localStorage.setItem('savedPassword', loginForm.password)
//   } else {
//     localStorage.removeItem('rememberMe')
//     localStorage.removeItem('savedEmail')
//     localStorage.removeItem('savedPassword')
//   }
// }

// 鍒濆鍖栨椂鍔犺浇璁颁綇鐨勭櫥褰曚俊鎭?loadRememberedCredentials()
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
}

.login-form {
  margin-bottom: 20px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  font-size: 14px;
  color: #409eff;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.register-link {
  font-size: 14px;
  color: #666;
}

.register-button {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.3s;
}

.register-button:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.error-alert {
  margin-top: 20px;
}

.login-footer-info {
  margin-top: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.login-footer-info p {
  margin: 4px 0;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>
