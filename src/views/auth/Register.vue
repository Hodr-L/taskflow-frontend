<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">创建账户</h1>
        <p class="register-subtitle">加入 {{ appName }}，开始高效协作</p>
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
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            size="large"
            :prefix-icon="Message"
            autocomplete="email"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
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
            placeholder="请确认密码"
            size="large"
            :prefix-icon="Lock"
            autocomplete="new-password"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="agreeTerms">
            我已阅读并同意
            <router-link to="/terms" class="terms-link">服务条款</router-link>
            和
            <router-link to="/privacy" class="terms-link">隐私政策</router-link>
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
            {{ loading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <p class="login-link">
            已有账户？
            <router-link to="/login" class="login-button">
              立即登录
            </router-link>
          </p>
        </div>
      </el-form>

      <!-- 错误提示 -->
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        :closable="true"
        @close="errorMessage = ''"
        class="error-alert"
      />

      <!-- 成功提示 -->
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
      <p>© 2026 {{ appName }}. All rights reserved.</p>
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

// 应用信息
const appName = import.meta.env.VITE_APP_NAME
const appVersion = import.meta.env.VITE_APP_VERSION

// 表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const agreeTerms = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 表单验证规则
const validateUsername = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (value.length < 3) {
    callback(new Error('用户名长度不能少于3个字符'))
  } else if (value.length > 50) {
    callback(new Error('用户名长度不能超过50个字符'))
  } else {
    callback()
  }
}

const validatePassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6个字符'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 处理注册
const handleRegister = async () => {
  if (!agreeTerms.value) {
    ElMessage.warning('请先同意服务条款和隐私政策')
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
      registerForm.password
    )
    
    if (result.success) {
      successMessage.value = '注册成功！正在跳转到仪表板...'
      ElMessage.success('注册成功')
      
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      errorMessage.value = result.error || '注册失败'
    }
  } catch (error: any) {
    errorMessage.value = error.message || '注册失败，请检查网络连接'
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