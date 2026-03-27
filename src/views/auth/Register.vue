<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">鍒涘缓璐︽埛</h1>
        <p class="register-subtitle">鍔犲叆 {{ appName }}锛屽紑濮嬮珮鏁堝崗浣?/p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="璇疯緭鍏ョ敤鎴峰悕"
            size="large"
            :prefix-icon="User"
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="璇疯緭鍏ラ偖绠?
            size="large"
            :prefix-icon="Message"
            autocomplete="email"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="璇疯緭鍏ュ瘑鐮?
            size="large"
            :prefix-icon="Lock"
            autocomplete="new-password"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="璇风‘璁ゅ瘑鐮?
            size="large"
            :prefix-icon="Lock"
            autocomplete="new-password"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="agreeTerms">
            鎴戝凡闃呰骞跺悓鎰?            <router-link to="/terms" class="terms-link">鏈嶅姟鏉℃</router-link>
            鍜?            <router-link to="/privacy" class="terms-link">闅愮鏀跨瓥</router-link>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-button"
            :loading="loading"
            :disabled="!agreeTerms"
            @click="handleRegister"
          >
            {{ loading ? '娉ㄥ唽涓?..' : '娉ㄥ唽' }}
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <p class="login-link">
            宸叉湁璐︽埛锛?            <router-link to="/login" class="login-button"> 绔嬪嵆鐧诲綍 </router-link>
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

      <!-- 鎴愬姛鎻愮ず -->
      <el-alert
        v-if="successMessage"
        :title="successMessage"
        type="success"
        show-icon
        :closable="true"
        @close="successMessage = ''"
        class="success-alert"
      />
    </div>

    <div class="register-footer-info">
      <p>漏 2026 {{ appName }}. All rights reserved.</p>
      <p>Version {{ appVersion }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Message, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 搴旂敤淇℃伅
const appName = import.meta.env.VITE_APP_NAME
const appVersion = import.meta.env.VITE_APP_VERSION

// 琛ㄥ崟鏁版嵁
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const agreeTerms = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 琛ㄥ崟楠岃瘉瑙勫垯
const validateUsername = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('璇疯緭鍏ョ敤鎴峰悕'))
  } else if (value.length < 3) {
    callback(new Error('鐢ㄦ埛鍚嶉暱搴︿笉鑳藉皯浜?涓瓧绗?))
  } else if (value.length > 50) {
    callback(new Error('鐢ㄦ埛鍚嶉暱搴︿笉鑳借秴杩?0涓瓧绗?))
  } else {
    callback()
  }
}

const validatePassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('璇疯緭鍏ュ瘑鐮?))
  } else if (value.length < 6) {
    callback(new Error('瀵嗙爜闀垮害涓嶈兘灏戜簬6涓瓧绗?))
  } else {
    callback()
  }
}

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('璇风‘璁ゅ瘑鐮?))
  } else if (value !== registerForm.password) {
    callback(new Error('涓ゆ杈撳叆鐨勫瘑鐮佷笉涓€鑷?))
  } else {
    callback()
  }
}

const registerRules = {
  username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
  email: [
    { required: true, message: '璇疯緭鍏ラ偖绠卞湴鍧€', trigger: 'blur' },
    { type: 'email', message: '璇疯緭鍏ユ纭殑閭鍦板潃', trigger: 'blur' },
  ],
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
}

// 澶勭悊娉ㄥ唽
const handleRegister = async () => {
  if (!agreeTerms.value) {
    ElMessage.warning('璇峰厛鍚屾剰鏈嶅姟鏉℃鍜岄殣绉佹斂绛?)
    return
  }

  if (loading.value) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const result = await authStore.userRegister(
      registerForm.username,
      registerForm.email,
      registerForm.password,
    )

    if (result.success) {
      successMessage.value = '娉ㄥ唽鎴愬姛锛佹鍦ㄨ烦杞埌浠〃鏉?..'
      ElMessage.success('娉ㄥ唽鎴愬姛')

      // 寤惰繜璺宠浆锛岃鐢ㄦ埛鐪嬪埌鎴愬姛娑堟伅
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      errorMessage.value = result.error || '娉ㄥ唽澶辫触'
    }
  } catch (error: any) {
    errorMessage.value = error.message || '娉ㄥ唽澶辫触锛岃妫€鏌ョ綉缁滆繛鎺?
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
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

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 14px;
  color: #666;
}

.register-form {
  margin-bottom: 20px;
}

.terms-link {
  color: #409eff;
  text-decoration: none;
  margin: 0 4px;
  transition: color 0.3s;
}

.terms-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.login-link {
  font-size: 14px;
  color: #666;
}

.login-button {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.3s;
}

.login-button:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.error-alert,
.success-alert {
  margin-top: 20px;
}

.register-footer-info {
  margin-top: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.register-footer-info p {
  margin: 4px 0;
}

@media (max-width: 480px) {
  .register-card {
    padding: 30px 20px;
  }

  .register-title {
    font-size: 24px;
  }
}
</style>
