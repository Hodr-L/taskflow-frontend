<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="profile-header">
          <h2>个人资料</h2>
          <p>管理您的账户信息和设置</p>
        </div>
      </template>

      <div class="profile-content">
        <div class="profile-section">
          <h3>基本信息</h3>

          <div class="avatar-section">
            <el-avatar :size="80" :src="user.avatar_url">
              {{ usernameInitials }}
            </el-avatar>
          </div>

          <el-form label-width="100px" class="profile-form">
            <el-form-item label="用户名">
              <el-input v-model="user.username" disabled />
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input v-model="user.email" disabled />
            </el-form-item>

            <el-form-item label="角色">
              <el-tag :type="getRoleType(user.role)">
                {{ getRoleText(user.role) }}
              </el-tag>
            </el-form-item>
          </el-form>
        </div>

        <div class="profile-section">
          <h3>账户安全</h3>

          <div class="security-items">
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">密码</div>
                <div class="security-description">定期更改密码以确保账户安全</div>
              </div>
              <el-button type="primary" @click="showPasswordDialog = true"> 更改密码 </el-button>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h3>账户信息</h3>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">用户ID</div>
              <div class="info-value">{{ user.id }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">注册时间</div>
              <div class="info-value">{{ formatDate(user.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/auth'

const authStore = useAuthStore()

// 用户信息
const user = computed(
  () =>
    authStore.user ||
    ({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      avatar_url: '',
      role: 'user',
      created_at: new Date().toISOString(),
    } as User),
)

// 用户名首字母
const usernameInitials = computed(() => {
  const name = user.value.username || ''
  return name.substring(0, 2).toUpperCase()
})

// 状态
const showPasswordDialog = ref(false)

// 获取角色类型
const getRoleType = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'danger'
    case 'admin':
      return 'warning'
    default:
      return 'success'
  }
}

// 获取角色文本
const getRoleText = (role: string) => {
  switch (role) {
    case 'super_admin':
      return '超级管理员'
    case 'admin':
      return '管理员'
    default:
      return '普通用户'
  }
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  text-align: center;
  padding: 20px 0;
}

.profile-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.profile-header p {
  font-size: 14px;
  color: #909399;
}

.profile-content {
  padding: 20px 0;
}

.profile-section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #e4e7ed;
}

.profile-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.profile-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.profile-form {
  max-width: 500px;
  margin: 0 auto;
}

.security-items {
  max-width: 600px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.security-info {
  flex: 1;
}

.security-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.security-description {
  font-size: 12px;
  color: #909399;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  max-width: 600px;
}

.info-item {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.info-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.info-value {
  font-weight: 500;
  color: #303133;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .security-item .el-button {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 16px;
  }

  .profile-form :deep(.el-form-item__label) {
    width: 80px !important;
  }

  .profile-form :deep(.el-form-item__content) {
    margin-left: 80px !important;
  }
}
</style>
