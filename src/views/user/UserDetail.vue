<template>
  <div class="user-detail-container">
    <!-- 用户头部信息 -->
    <div class="user-header">
      <div class="user-header-main">
        <div class="user-avatar-section">
          <el-avatar :size="80" :src="user.avatar_url">
            {{ (user.username || 'U').substring(0, 1).toUpperCase() }}
          </el-avatar>
        </div>
        
        <div class="user-info-section">
          <h1 class="user-name">{{ user.fullname || user.username }}</h1>
          <div class="user-meta">
            <el-tag :type="getRoleTagType(user.role)" size="large">
              {{ getRoleText(user.role) }}
            </el-tag>
            <el-tag :type="getStatusTagType(user.status || 'active')" size="large">
              {{ getStatusText(user.status || 'active') }}
            </el-tag>
            <el-tag :type="user.email_verified ? 'success' : 'warning'" size="large">
              {{ user.email_verified ? '邮箱已验证' : '邮箱未验证' }}
            </el-tag>
          </div>
          <div class="user-contact">
            <span class="contact-item">
              <el-icon><User /></el-icon>
              <span>{{ user.username }}</span>
            </span>
            <span class="contact-item">
              <el-icon><Message /></el-icon>
              <span>{{ user.email }}</span>
            </span>
          </div>
        </div>
        
        <div class="user-actions">
          <el-button type="primary" :icon="Edit" @click="handleEdit">编辑</el-button>
          <el-dropdown @command="handleMoreCommand">
            <el-button :icon="More">更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="user.status === 'active'" :icon="Lock" command="disable">禁用账户</el-dropdown-item>
                <el-dropdown-item v-else :icon="Unlock" command="enable">启用账户</el-dropdown-item>
                <el-dropdown-item :icon="Key" command="resetPassword">重置密码</el-dropdown-item>
                <el-dropdown-item :icon="Message" command="sendVerification">发送验证邮件</el-dropdown-item>
                <el-dropdown-item divided :icon="Delete" command="delete">删除账户</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 选项卡 -->
    <div class="user-tabs">
      <el-tabs v-model="activeTab" class="user-detail-tabs">
        <el-tab-pane label="基本信息" name="info">
          <div class="tab-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户ID">{{ user.id }}</el-descriptions-item>
              <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
              <el-descriptions-item label="姓名">{{ user.fullname || '未设置' }}</el-descriptions-item>
              <el-descriptions-item label="职位/简介">{{ user.bio || '未设置' }}</el-descriptions-item>
              <el-descriptions-item label="角色">{{ getRoleText(user.role) }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ getStatusText(user.status || 'active') }}</el-descriptions-item>
              <el-descriptions-item label="邮箱验证">{{ user.email_verified ? '已验证' : '未验证' }}</el-descriptions-item>
              <el-descriptions-item label="最后登录">{{ formatDate(user.last_login_at) || '从未登录' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatDate(user.created_at) }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ formatDate(user.updated_at) }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="所属团队" name="teams">
          <div class="tab-content">
            <h3>团队列表</h3>
            <p v-if="userTeams.length === 0">该用户尚未加入任何团队</p>
            <div v-else class="teams-grid">
              <el-card 
                v-for="team in userTeams" 
                :key="team.id"
                class="team-card"
                shadow="hover"
              >
                <template #header>
                  <div class="team-card-header">
                    <h4>{{ team.name }}</h4>
                    <el-tag size="small">{{ team.role }}</el-tag>
                  </div>
                </template>
                <p>{{ team.description || '暂无描述' }}</p>
                <div class="team-card-footer">
                  <span>加入时间: {{ formatDate(team.joined_at) }}</span>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="项目统计" name="projects">
          <div class="tab-content">
            <h3>项目参与情况</h3>
            <div class="project-stats">
              <el-card class="stat-card">
                <div class="stat-content">
                  <span class="stat-number">{{ projectStats.total || 0 }}</span>
                  <span class="stat-label">参与项目数</span>
                </div>
              </el-card>
              <el-card class="stat-card">
                <div class="stat-content">
                  <span class="stat-number" style="color: #67c23a;">{{ projectStats.completed || 0 }}</span>
                  <span class="stat-label">已完成项目</span>
                </div>
              </el-card>
              <el-card class="stat-card">
                <div class="stat-content">
                  <span class="stat-number" style="color: #e6a23c;">{{ projectStats.active || 0 }}</span>
                  <span class="stat-label">进行中项目</span>
                </div>
              </el-card>
              <el-card class="stat-card">
                <div class="stat-content">
                  <span class="stat-number" style="color: #1989fa;">{{ projectStats.tasks || 0 }}</span>
                  <span class="stat-label">总任务数</span>
                </div>
              </el-card>
            </div>
            
            <el-table
              :data="userProjects"
              style="width: 100%"
              class="project-table"
            >
              <el-table-column label="项目名称" min-width="200">
                <template #default="{ row }">
                  <div class="project-cell">
                    <div class="project-name">{{ row.name }}</div>
                    <div class="project-team">{{ row.team_name }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="角色" width="120">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.role }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                    {{ row.status === 'active' ? '进行中' : row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="任务数" width="100">
                <template #default="{ row }">
                  {{ row.task_count || 0 }}
                </template>
              </el-table-column>
              <el-table-column label="加入时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.joined_at) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="活动日志" name="activities">
          <div class="tab-content">
            <h3>用户活动记录</h3>
            <p>活动日志功能开发中...</p>
            <!-- 这里可以添加活动日志列表 -->
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑用户"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="editForm.username"
            placeholder="请输入用户名"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="editForm.email"
            type="email"
            placeholder="请输入邮箱"
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item label="姓名" prop="fullname">
          <el-input
            v-model="editForm.fullname"
            placeholder="请输入姓名"
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item label="职位/简介" prop="bio">
          <el-input
            v-model="editForm.bio"
            placeholder="请输入职位或简介"
            maxlength="255"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="editForm.role" placeholder="请选择角色" style="width: 100%">
                <el-option label="普通用户" value="user" />
                <el-option label="管理员" value="admin" />
                <el-option label="超级管理员" value="super_admin" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="editForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="活跃" value="active" />
                <el-option label="未激活" value="inactive" />
                <el-option label="禁用" value="banned" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="头像URL" prop="avatar_url">
          <el-input
            v-model="editForm.avatar_url"
            placeholder="请输入头像URL"
            maxlength="255"
          />
        </el-form-item>
        
        <el-form-item label="邮箱验证" prop="email_verified">
          <el-switch
            v-model="editForm.email_verified"
            active-text="已验证"
            inactive-text="未验证"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit" :loading="editing">
            更新
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  Edit, More, Lock, Unlock, Key, Message, Delete, User 
} from '@element-plus/icons-vue'
import type { User as UserType } from '@/types/user'
import { getUserById, updateUser } from '@/services/user'

const route = useRoute()
const router = useRouter()

// 响应式数据
const user = ref<UserType>({
  id: Number(route.params.id) || 1,
  username: 'developer',
  email: 'dev@example.com',
  fullname: '开发工程师',
  bio: '后端开发工程师，专注于Go和微服务架构',
  avatar_url: 'https://via.placeholder.com/150',
  role: 'user',
  status: 'active',
  email_verified: true,
  last_login_at: '2026-03-20T09:15:00Z',
  created_at: '2026-02-01T14:30:00Z',
  updated_at: '2026-03-20T09:15:00Z'
})

const loading = ref(false)

// 加载用户数据
const loadUser = async () => {
  loading.value = true
  try {
    const userId = Number(route.params.id)
    if (!userId) {
      ElMessage.error('用户ID无效')
      return
    }
    
    const response = await getUserById(userId)
    // 注意：api.ts拦截器返回response.data.data，所以对于GET /users/{id}，
    // 后端返回的是{ user: {...} }，拦截器提取data后得到{ user: {...} }
    // 但实际上getUserById期望直接返回User对象
    // 根据服务层定义，getUserById应该返回User对象
    // 所以这里response应该就是User对象
    user.value = response
  } catch (error: any) {
    console.error('加载用户数据失败:', error)
    if (error.code === 403) {
      ElMessage.error('权限不足，无法查看用户详情')
      router.push('/users')
    } else if (error.code === 404) {
      ElMessage.error('用户不存在')
      router.push('/users')
    } else {
      ElMessage.error(error.message || '加载用户数据失败')
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUser()
})

const userTeams = ref([
  {
    id: 1,
    name: '开发团队',
    description: '负责产品开发和技术支持',
    role: 'developer',
    joined_at: '2026-02-05T10:00:00Z'
  },
  {
    id: 2,
    name: '测试团队',
    description: '负责质量保证和测试',
    role: 'tester',
    joined_at: '2026-02-10T14:30:00Z'
  }
])

const userProjects = ref([
  {
    id: 1,
    name: 'TaskFlow 开发',
    team_name: '开发团队',
    role: 'developer',
    status: 'active',
    task_count: 15,
    joined_at: '2026-02-15T09:00:00Z'
  },
  {
    id: 2,
    name: '移动应用开发',
    team_name: '开发团队',
    role: 'developer',
    status: 'active',
    task_count: 8,
    joined_at: '2026-02-20T14:00:00Z'
  },
  {
    id: 3,
    name: '数据库迁移',
    team_name: '测试团队',
    role: 'tester',
    status: 'completed',
    task_count: 5,
    joined_at: '2026-02-25T10:30:00Z'
  }
])

const activeTab = ref('info')
const showEditDialog = ref(false)
const editing = ref(false)

const editForm = ref({
  username: '',
  email: '',
  fullname: '',
  bio: '',
  role: 'user',
  status: 'active',
  avatar_url: '',
  email_verified: false
})

const editFormRef = ref<FormInstance>()
const editFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const projectStats = computed(() => {
  const total = userProjects.value.length
  const active = userProjects.value.filter(p => p.status === 'active').length
  const completed = userProjects.value.filter(p => p.status === 'completed').length
  const tasks = userProjects.value.reduce((sum, project) => sum + (project.task_count || 0), 0)
  
  return {
    total,
    active,
    completed,
    tasks
  }
})

// 方法
const handleEdit = () => {
  editForm.value = {
    username: user.value.username,
    email: user.value.email,
    fullname: user.value.fullname || '',
    bio: user.value.bio || '',
    role: user.value.role,
    status: user.value.status || 'active',
    avatar_url: user.value.avatar_url || '',
    email_verified: user.value.email_verified || false
  }
  showEditDialog.value = true
}

const handleMoreCommand = (command: string) => {
  switch (command) {
    case 'disable':
      disableUser()
      break
    case 'enable':
      enableUser()
      break
    case 'resetPassword':
      resetPassword()
      break
    case 'sendVerification':
      sendVerification()
      break
    case 'delete':
      deleteUser()
      break
  }
}

const disableUser = () => {
  ElMessageBox.confirm(
    `确定要禁用用户 "${user.value.username}" 吗？禁用后该用户将无法登录系统。`,
    '确认禁用',
    { type: 'warning' }
  ).then(async () => {
    try {
      await updateUser(user.value.id, { status: 'banned' })
      user.value.status = 'banned'
      ElMessage.success('用户已禁用')
    } catch (error: any) {
      console.error('禁用用户失败:', error)
      ElMessage.error(error.message || '禁用用户失败')
    }
  })
}

const enableUser = () => {
  ElMessageBox.confirm(
    `确定要启用用户 "${user.value.username}" 吗？`,
    '确认启用',
    { type: 'info' }
  ).then(async () => {
    try {
      await updateUser(user.value.id, { status: 'active' })
      user.value.status = 'active'
      ElMessage.success('用户已启用')
    } catch (error: any) {
      console.error('启用用户失败:', error)
      ElMessage.error(error.message || '启用用户失败')
    }
  })
}

const resetPassword = () => {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'password',
    inputPattern: /^.{6,100}$/,
    inputErrorMessage: '密码长度需在6-100个字符之间'
  }).then(async ({ value }) => {
    if (!value) return
    
    try {
      await resetUserPassword(user.value.id, { new_password: value })
      ElMessage.success('密码重置成功')
    } catch (error: any) {
      console.error('重置密码失败:', error)
      ElMessage.error(error.message || '重置密码失败')
    }
  })
}

const sendVerification = () => {
  ElMessage.info('验证邮件已发送')
  // 这里应该调用API发送验证邮件
}

const deleteUser = () => {
  ElMessageBox.confirm(
    `确定要删除用户 "${user.value.username}" 吗？删除后数据将无法恢复。`,
    '确认删除',
    { type: 'error', confirmButtonText: '删除' }
  ).then(() => {
    ElMessage.success('用户已删除')
    router.push('/users')
  })
}

const handleDialogClose = () => {
  showEditDialog.value = false
  editFormRef.value?.resetFields()
}

const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  editFormRef.value.validate(async (valid) => {
    if (valid) {
      editing.value = true
      try {
        const updateData = {
          username: editForm.value.username,
          email: editForm.value.email,
          fullname: editForm.value.fullname || undefined,
          bio: editForm.value.bio || undefined,
          role: editForm.value.role as 'user' | 'admin' | 'super_admin',
          status: editForm.value.status as 'active' | 'inactive' | 'banned',
          avatar_url: editForm.value.avatar_url || undefined,
          email_verified: editForm.value.email_verified
        }
        
        await updateUser(user.value.id, updateData)
        
        // 重新加载用户数据
        await loadUser()
        
        editing.value = false
        showEditDialog.value = false
        ElMessage.success('用户信息已更新')
      } catch (error: any) {
        console.error('更新用户信息失败:', error)
        if (error.code === 403) {
          ElMessage.error('权限不足，无法更新用户信息')
        } else if (error.code === 404) {
          ElMessage.error('用户不存在')
        } else {
          ElMessage.error(error.message || '更新用户信息失败')
        }
        editing.value = false
      }
    }
  })
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
  // 这里应该根据路由参数加载用户数据
  const userId = route.params.id
  console.log('加载用户数据:', userId)
})
</script>

<style scoped>
.user-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 30px;
  color: white;
  margin-bottom: 24px;
}

.user-header-main {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar-section {
  flex-shrink: 0;
}

.user-info-section {
  flex: 1;
}

.user-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
}

.user-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.user-contact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
}

.user-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.user-tabs {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.user-detail-tabs {
  padding: 0 20px;
}

:deep(.el-tabs__header) {
  margin: 0;
}

.tab-content {
  padding: 20px 0;
  min-height: 400px;
}

.tab-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.team-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.team-card:hover {
  transform: translateY(-4px);
}

.team-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-card-footer {
  margin-top: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.project-stats {
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

.project-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
}

.project-team {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.project-table {
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .user-header-main {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .user-actions {
    width: 100%;
    justify-content: center;
  }
  
  .teams-grid {
    grid-template-columns: 1fr;
  }
  
  .project-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .project-stats {
    grid-template-columns: 1fr;
  }
}
</style>