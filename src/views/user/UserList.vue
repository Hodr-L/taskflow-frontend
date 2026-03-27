<template>
  <div class="user-list-container">
    <div class="user-header">
      <h2 class="user-title">用户管理</h2>
      <p class="user-subtitle">管理系统用户，分配角色和权限</p>
      
      <div class="user-actions">
        <el-button type="primary" size="large" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
        <el-button :icon="Refresh" @click="refreshUsers">刷新</el-button>
        <el-button :icon="Download" @click="exportUsers">导出</el-button>
      </div>
    </div>

    <!-- 过滤和搜索 -->
    <div class="user-filters">
      <el-input
        v-model="searchText"
        placeholder="搜索用户名、邮箱或姓名"
        clearable
        class="search-input"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="filterRole" placeholder="角色" clearable @change="handleFilter" multiple>
        <el-option label="普通用户" value="user" />
        <el-option label="管理员" value="admin" />
        <el-option label="超级管理员" value="super_admin" />
      </el-select>
      
      <el-select v-model="filterStatus" placeholder="状态" clearable @change="handleFilter">
        <el-option label="活跃" value="active" />
        <el-option label="未激活" value="inactive" />
        <el-option label="禁用" value="banned" />
      </el-select>
      
      <el-select v-model="filterEmailVerified" placeholder="邮箱验证" clearable @change="handleFilter">
        <el-option label="已验证" :value="true" />
        <el-option label="未验证" :value="false" />
      </el-select>
    </div>

    <!-- 用户统计 -->
    <div class="user-stats">
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <span class="stat-number">{{ userStats.total || 0 }}</span>
          <span class="stat-label">总用户数</span>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <span class="stat-number" style="color: #67c23a;">{{ userStats.active || 0 }}</span>
          <span class="stat-label">活跃用户</span>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <span class="stat-number" style="color: #e6a23c;">{{ (userStats.admin || 0) + (userStats.super_admin || 0) }}</span>
          <span class="stat-label">管理员</span>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <span class="stat-number" style="color: #909399;">{{ userStats.unverified || 0 }}</span>
          <span class="stat-label">未验证</span>
        </div>
      </el-card>
    </div>

    <!-- 用户表格 -->
    <el-card class="user-table-card">
      <el-table
        :data="filteredUsers"
        style="width: 100%"
        @row-click="viewUser"
        :row-class-name="tableRowClassName"
        v-loading="loading"
      >
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="40" :src="row.avatar_url">
                {{ (row.username || 'U').substring(0, 1).toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <div class="user-name">{{ row.fullname || row.username }}</div>
                <div class="user-email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" size="small" effect="light">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small" effect="light">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="邮箱验证" width="100">
          <template #default="{ row }">
            <el-tag :type="row.email_verified ? 'success' : 'warning'" size="small">
              {{ row.email_verified ? '已验证' : '未验证' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="最后登录" width="180">
          <template #default="{ row }">
            <span>{{ formatDate(row.last_login_at) || '从未登录' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            <span>{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="viewUser(row.id)">查看</el-button>
            <el-button type="info" link size="small" @click.stop="editUser(row)">编辑</el-button>
            <el-button 
              v-if="row.status === 'active'" 
              type="warning" 
              link 
              size="small" 
              @click.stop="disableUser(row)"
            >
              禁用
            </el-button>
            <el-button 
              v-else 
              type="success" 
              link 
              size="small" 
              @click.stop="enableUser(row)"
            >
              启用
            </el-button>
            <el-button 
              v-if="currentUser?.id !== row.id && row.role !== 'super_admin'" 
              type="danger" 
              link 
              size="small" 
              @click.stop="deleteUser(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalUsers"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      v-model="showUserDialog"
      :title="editingUser ? '编辑用户' : '添加用户'"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="userForm.email"
            type="email"
            placeholder="请输入邮箱"
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item v-if="!editingUser" label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item label="姓名" prop="fullname">
          <el-input
            v-model="userForm.fullname"
            placeholder="请输入姓名"
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item label="职位/简介" prop="bio">
          <el-input
            v-model="userForm.bio"
            placeholder="请输入职位或简介"
            maxlength="255"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
                <el-option label="普通用户" value="user" />
                <el-option label="管理员" value="admin" />
                <el-option label="超级管理员" value="super_admin" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="userForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="活跃" value="active" />
                <el-option label="未激活" value="inactive" />
                <el-option label="禁用" value="banned" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="头像URL" prop="avatar_url">
          <el-input
            v-model="userForm.avatar_url"
            placeholder="请输入头像URL"
            maxlength="255"
          />
          <div class="avatar-preview" v-if="userForm.avatar_url">
            <el-avatar :size="60" :src="userForm.avatar_url">
              {{ (userForm.username || 'U').substring(0, 1).toUpperCase() }}
            </el-avatar>
          </div>
        </el-form-item>
        
        <el-form-item label="邮箱验证" prop="email_verified">
          <el-switch
            v-model="userForm.email_verified"
            active-text="已验证"
            inactive-text="未验证"
          />
        </el-form-item>
        
        <el-form-item v-if="editingUser" label="重置密码" prop="reset_password">
          <el-switch
            v-model="userForm.reset_password"
            active-text="重置密码"
            inactive-text="保持原密码"
            @change="handleResetPasswordChange"
          />
        </el-form-item>
        
        <el-form-item 
          v-if="editingUser && userForm.reset_password" 
          label="新密码" 
          prop="new_password"
        >
          <el-input
            v-model="userForm.new_password"
            type="password"
            placeholder="请输入新密码"
            show-password
            maxlength="100"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingUser ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Search, Refresh, Download } from '@element-plus/icons-vue'
import type { User } from '@/types/user'
import { getUsers, createUser, updateUser, deleteUser as deleteUserApi, getUserStats, type GetUsersParams } from '@/services/user'

const router = useRouter()
const authStore = useAuthStore()

// 当前登录用户
const currentUser = computed(() => authStore.user)

// 响应式数据
const users = ref<User[]>([])
const totalUsers = ref(0)
const loading = ref(false)
const statsLoading = ref(false)
const userStats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  banned: 0,
  admin: 0,
  super_admin: 0,
  unverified: 0
})

const searchText = ref('')
const filterRole = ref<string[]>([])
const filterStatus = ref('')
const filterEmailVerified = ref<boolean | undefined>(undefined)
const showUserDialog = ref(false)
const editingUser = ref<User | null>(null)
const submitting = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)

const userForm = ref({
  username: '',
  email: '',
  password: '',
  fullname: '',
  bio: '',
  role: 'user',
  status: 'active',
  avatar_url: '',
  email_verified: false,
  reset_password: false,
  new_password: ''
})

const userFormRef = ref<FormInstance>()
const userFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '长度在 6 到 100 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
// 注意：过滤现在由后端API处理，这里直接返回用户列表
const filteredUsers = computed(() => {
  return users.value
})

// 加载用户数据
const loadUsers = async () => {
  loading.value = true
  try {
    const params: GetUsersParams = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchText.value || undefined,
      role: filterRole.value.length > 0 ? filterRole.value[0] : undefined,
      status: filterStatus.value || undefined,
      email_verified: filterEmailVerified.value
    }
    
    const response = await getUsers(params)
    // api.ts拦截器返回response.data.data，所以response直接就是UsersData
    users.value = response.users || []
    totalUsers.value = response.pagination?.total || 0
  } catch (error: any) {
    console.error('加载用户列表失败:', error)
    if (error.code === 403) {
      ElMessage.error('权限不足，无法访问用户管理')
      router.push('/dashboard')
    } else {
      ElMessage.error(error.message || '加载用户列表失败')
    }
  } finally {
    loading.value = false
  }
}

// 加载用户统计信息
const loadUserStats = async () => {
  statsLoading.value = true
  try {
    const response = await getUserStats()
    userStats.value = response
  } catch (error) {
    console.warn('加载用户统计失败（功能不影响）:', error.message || error)
    // 统计信息加载失败不影响主功能，保持默认值
  } finally {
    statsLoading.value = false
  }
}

// 方法
const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handleFilter = () => {
  currentPage.value = 1
  loadUsers()
}

const refreshUsers = () => {
  loadUsers()
  loadUserStats()
  ElMessage.success('用户列表已刷新')
}

const exportUsers = () => {
  ElMessage.info('导出功能开发中...')
}

const viewUser = (user: User | number) => {
  const userId = typeof user === 'number' ? user : user.id
  router.push(`/users/${userId}`)
}

const handleCreate = () => {
  editingUser.value = null
  userForm.value = {
    username: '',
    email: '',
    password: '',
    fullname: '',
    bio: '',
    role: 'user',
    status: 'active',
    avatar_url: '',
    email_verified: false,
    reset_password: false,
    new_password: ''
  }
  showUserDialog.value = true
}

const editUser = (user: User) => {
  editingUser.value = user
  userForm.value = {
    username: user.username,
    email: user.email,
    password: '',
    fullname: user.fullname || '',
    bio: user.bio || '',
    role: user.role,
    status: user.status || 'active',
    avatar_url: user.avatar_url || '',
    email_verified: user.email_verified || false,
    reset_password: false,
    new_password: ''
  }
  showUserDialog.value = true
}

const disableUser = (user: User) => {
  ElMessageBox.confirm(
    `确定要禁用用户 "${user.username}" 吗？禁用后该用户将无法登录系统。`,
    '确认禁用',
    { type: 'warning' }
  ).then(async () => {
    try {
      await updateUser(user.id, { status: 'banned' })
      await loadUsers()
      await loadUserStats()
      ElMessage.success('用户已禁用')
    } catch (error: any) {
      ElMessage.error(error.message || '禁用失败')
    }
  })
}

const enableUser = (user: User) => {
  ElMessageBox.confirm(
    `确定要启用用户 "${user.username}" 吗？`,
    '确认启用',
    { type: 'info' }
  ).then(async () => {
    try {
      await updateUser(user.id, { status: 'active' })
      await loadUsers()
      await loadUserStats()
      ElMessage.success('用户已启用')
    } catch (error: any) {
      ElMessage.error(error.message || '启用失败')
    }
  })
}

const deleteUser = (user: User) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${user.username}" 吗？删除后数据将无法恢复。`,
    '确认删除',
    { type: 'error', confirmButtonText: '删除' }
  ).then(async () => {
    try {
      await deleteUserApi(user.id)
      await loadUsers()
      await loadUserStats()
      ElMessage.success('用户已删除')
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const handleDialogClose = () => {
  showUserDialog.value = false
  editingUser.value = null
  userFormRef.value?.resetFields()
}

const handleResetPasswordChange = (value: boolean) => {
  if (!value) {
    userForm.value.new_password = ''
  }
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (editingUser.value) {
          // 更新用户
          const updateData = {
            username: userForm.value.username,
            email: userForm.value.email,
            fullname: userForm.value.fullname || undefined,
            bio: userForm.value.bio || undefined,
            role: userForm.value.role as 'user' | 'admin' | 'super_admin',
            status: userForm.value.status as 'active' | 'inactive' | 'banned',
            avatar_url: userForm.value.avatar_url || undefined,
            email_verified: userForm.value.email_verified
          }
          
          await updateUser(editingUser.value.id, updateData)
          ElMessage.success('用户更新成功')
        } else {
          // 创建用户
          const createData = {
            username: userForm.value.username,
            email: userForm.value.email,
            password: userForm.value.password,
            fullname: userForm.value.fullname || undefined,
            bio: userForm.value.bio || undefined,
            role: userForm.value.role as 'user' | 'admin' | 'super_admin',
            status: userForm.value.status as 'active' | 'inactive' | 'banned',
            avatar_url: userForm.value.avatar_url || undefined,
            email_verified: userForm.value.email_verified || false
          }
          
          await createUser(createData)
          ElMessage.success('用户创建成功')
        }
        
        // 重新加载数据
        await loadUsers()
        await loadUserStats()
        showUserDialog.value = false
        userFormRef.value?.resetFields()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  loadUsers()
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  loadUsers()
}

const tableRowClassName = ({ row }: { row: User }) => {
  const status = row.status || 'active'
  if (status === 'banned') {
    return 'user-row-banned'
  } else if (status === 'inactive') {
    return 'user-row-inactive'
  }
  return ''
}

const getRoleTagType = (role: string) => {
  const map: Record<string, string> = {
    super_admin: 'danger',
    admin: 'warning',
    user: 'success'
  }
  return map[role] || 'info'
}

const getRoleText = (role: string) => {
  const map: Record<string, string> = {
    super_admin: '超级管理员',
    admin: '管理员',
    user: '普通用户'
  }
  return map[role] || role
}

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    banned: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    active: '活跃',
    inactive: '未激活',
    banned: '禁用'
  }
  return map[status] || status
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // 延迟检查权限，等待store初始化
  setTimeout(() => {
    // 首先尝试从localStorage读取用户数据
    let userRole = currentUser.value?.role
    if (!userRole) {
      try {
        const userInStorage = localStorage.getItem('user')
        if (userInStorage) {
          const userData = JSON.parse(userInStorage)
          userRole = userData.role
          console.log('UserList: 从localStorage读取用户角色:', userRole)
        }
      } catch (err) {
        console.error('UserList: 从localStorage读取用户数据失败:', err)
      }
    }
    
    // 如果仍然没有角色信息，重定向到登录页
    if (!userRole) {
      console.log('UserList: 用户未登录，跳转到登录页')
      router.push('/login')
      return
    }
    
    // 检查管理员权限
    const isAdmin = userRole === 'admin' || userRole === 'super_admin'
    if (!isAdmin) {
      ElMessage.error('权限不足，需要管理员权限')
      router.push('/dashboard')
      return
    }
    
    // 加载用户数据和统计信息
    loadUsers()
    loadUserStats()
  }, 500) // 延迟500ms等待store初始化
})
</script>

<style scoped>
.user-list-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.user-header {
  margin-bottom: 24px;
}

.user-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.user-subtitle {
  color: var(--el-text-color-secondary);
  margin: 0 0 16px 0;
}

.user-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.user-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.user-table-card {
  width: 100%;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
}

.user-email {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.avatar-preview {
  margin-top: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 表格行样式 */
:deep(.user-row-banned) {
  opacity: 0.6;
  background-color: rgba(245, 108, 108, 0.05);
}

:deep(.user-row-inactive) {
  background-color: rgba(144, 147, 153, 0.05);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .user-filters {
    flex-direction: column;
  }
  
  .search-input {
    max-width: 100%;
  }
  
  .user-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .user-stats {
    grid-template-columns: 1fr;
  }
  
  .user-actions {
    flex-direction: column;
  }
}
</style>