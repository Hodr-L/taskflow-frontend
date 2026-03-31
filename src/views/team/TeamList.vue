<template>
  <div class="team-list-container">
    <div class="team-header">
      <h2 class="team-title">团队管理</h2>
      <p class="team-subtitle">创建和管理您的协作团队</p>

      <div class="team-actions" v-if="canCreateTeam">
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建团队
        </el-button>
      </div>
    </div>

    <!-- 团队列表 -->
    <div class="team-grid">
      <div v-for="team in teams" :key="team.id" class="team-card" @click="viewTeam(team.id)">
        <div class="team-card-header">
          <div class="team-avatar">
            <el-avatar :size="48" :src="team.avatar_url">
              {{ team.name ? team.name.substring(0, 2).toUpperCase() : '??' }}
            </el-avatar>
          </div>
          <div class="team-info">
            <h3 class="team-name">{{ team.name }}</h3>
            <p class="team-description">{{ team.description }}</p>
          </div>
          <el-dropdown @command="handleTeamCommand($event, team.id)">
            <el-icon class="team-menu"><More /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑团队</el-dropdown-item>
                <el-dropdown-item command="members">管理成员</el-dropdown-item>
                <el-dropdown-item command="settings">团队设置</el-dropdown-item>
                <el-dropdown-item divided command="delete">删除团队</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="team-stats">
          <div class="stat-item">
            <el-icon><User /></el-icon>
            <span>{{ team.member_count || 0 }} 成员</span>
          </div>
          <div class="stat-item">
            <el-icon><Folder /></el-icon>
            <span>{{ team.project_count || 0 }} 项目</span>
          </div>
        </div>

        <div class="team-footer">
          <div class="team-info">
            <span class="create-time">{{ formatDate(team.created_at) }}</span>
          </div>
          <el-tag :type="team.privacy === 'public' ? 'success' : 'info'" size="small">
            {{ team.privacy === 'public' ? '公开' : '私有' }}
          </el-tag>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="teams.length === 0" class="empty-state">
        <el-empty description="暂无团队">
          <el-button type="primary" @click="showCreateDialog = true"> 创建第一个团队 </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 创建团队对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建团队"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="团队名称" prop="name">
          <el-input
            v-model="createForm.name"
            placeholder="请输入团队名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="团队描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入团队描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>


      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" :loading="creating" @click="handleCreateTeam">
            创建团队
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, More, User, Folder, List } from '@element-plus/icons-vue'
import { createTeam, getTeams, deleteTeam as deleteTeamApi } from '@/services/team'
import type { Team } from '@/types/team'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 计算当前用户角色
const userRole = computed(() => authStore.role)
const canCreateTeam = computed(() => {
  // 根据业务逻辑确定哪些角色可以创建团队
  // 通常管理员和超级管理员可以创建团队，普通用户可能也可以创建团队
  // 这里假设所有认证用户都可以创建团队，但可以根据需求调整
  // return ['admin', 'super_admin'].includes(userRole.value)
  // 或者：所有用户都可以创建团队（默认行为）
  return authStore.isAuthenticated
})

// 团队数据
const teams = ref<Team[]>([])

// 创建团队表单
const showCreateDialog = ref(false)
const creating = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  name: '',
  description: '',
  logo_url: '',
})

const createRules = {
  name: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 2, max: 50, message: '团队名称长度在2到50个字符之间', trigger: 'blur' },
  ],
  description: [
    { max: 200, message: '团队描述不能超过200个字符', trigger: 'blur' },
  ],
}

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  switch (role) {
    case 'owner':
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
    case 'owner':
      return '创建者'
    case 'admin':
      return '管理员'
    default:
      return '成员'
  }
}

// 查看团队详情
const viewTeam = (teamId: string) => {
  router.push(`/teams/${teamId}`)
}

// 处理团队命令
const handleTeamCommand = (command: string, teamId: string) => {
  switch (command) {
    case 'edit':
      editTeam(teamId)
      break
    case 'members':
      manageMembers(teamId)
      break
    case 'settings':
      teamSettings(teamId)
      break
    case 'delete':
      deleteTeam(teamId)
      break
  }
}

// 编辑团队
const editTeam = (teamId: string) => {
  ElMessage.info(`编辑团队 ${teamId}`)
}

// 管理成员
const manageMembers = (teamId: string) => {
  ElMessage.info(`管理团队 ${teamId} 的成员`)
}

// 团队设置
const teamSettings = (teamId: string) => {
  ElMessage.info(`团队 ${teamId} 设置`)
}

// 删除团队
const deleteTeam = async (teamId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个团队吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用删除团队的API
    console.log('正在删除团队:', teamId)
    try {
      await deleteTeamApi(teamId)
      console.log('团队删除API调用成功')
    } catch (apiError) {
      console.error('删除团队API调用失败:', apiError)
      // 检查是否是204 No Content（某些API返回空响应）
      // 注意：api.ts已经重新格式化了错误，所以直接检查status属性
      if (apiError?.status === 204) {
        console.log('API返回204 No Content，表示删除成功')
      } else {
        // 重新抛出错误，让外部catch处理
        throw apiError
      }
    }
    
    // 从前端列表中移除
    teams.value = teams.value.filter((team) => team.id !== teamId)
    ElMessage.success('团队删除成功')
  } catch (error) {
    if (error !== 'cancel') { // 用户取消不是错误
      console.error('删除团队失败:', error)
      ElMessage.error('删除团队失败，请重试')
    }
  }
}

// 创建团队
const handleCreateTeam = async () => {
  // 验证表单
  if (!createFormRef.value) return
  
  const isValid = await createFormRef.value.validate((valid) => valid)
  if (!isValid) {
    ElMessage.warning('请填写正确的表单信息')
    return
  }

  creating.value = true

  try {
    console.log('创建团队请求数据:', createForm)
    
    // 调用创建团队的API
    const response = await createTeam({
      name: createForm.name,
      description: createForm.description,
      logo_url: createForm.logo_url
    })
    
    console.log('创建团队API响应:', response)

    // 注意：api.ts拦截器已经提取了data字段，所以response应该是Team对象
    // 但为了兼容性，检查是否是标准API响应格式
    let newTeam: Team
    if (response && typeof response === 'object') {
      // 检查是否包含标准API字段
      if ('code' in response && 'data' in response) {
        // 这是未经过拦截器的原始响应格式
        newTeam = response.data
      } else if ('id' in response) {
        // 这已经是Team对象
        newTeam = response as Team
      } else {
        console.warn('未知的API响应格式:', response)
        throw new Error('服务器返回了未知的响应格式')
      }
    } else {
      console.warn('无效的API响应:', response)
      throw new Error('服务器返回了无效的响应')
    }

    // 将新团队添加到列表
    teams.value.unshift(newTeam)
    ElMessage.success('团队创建成功')
    showCreateDialog.value = false
    resetCreateForm()
  } catch (error: any) {
    console.error('创建团队失败:', error)
    ElMessage.error(error.message || '创建失败，请重试')
  } finally {
    creating.value = false
  }
}

// 重置创建表单
const resetCreateForm = () => {
  createForm.name = ''
  createForm.description = ''
  createForm.logo_url = ''
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return dateString
  }
}

// 对话框关闭处理
const handleDialogClose = (done: () => void) => {
  if (creating.value) {
    ElMessage.warning('正在创建中，请稍候')
    return
  }
  resetCreateForm()
  done()
}

// 加载团队列表
const loadTeams = async () => {
  try {
    const response = await getTeams()
    console.log('团队列表响应:', response)
    // 响应格式: { teams: [...], pagination: {...} }
    // 但根据API拦截器，data字段会被提取
    // 所以response可能是 { teams: [...], pagination: {...} }
    // 或直接是teams数组
    let teamsArray = []
    
    if (response && typeof response === 'object') {
      if (Array.isArray(response)) {
        teamsArray = response
      } else if (response.teams && Array.isArray(response.teams)) {
        teamsArray = response.teams
      }
    }
    
    // 过滤掉null或没有id的团队，并映射字段名
    teams.value = teamsArray.filter(team => team && team.id).map(team => {
      console.log('原始团队数据:', team)
      // 映射字段：将后端返回的 members_count 映射到前端的 member_count
      // 将后端返回的 projects_count 映射到前端的 project_count
      // 同时确保 avatar_url 和 logo_url 的兼容性
      const mappedTeam = {
        ...team,
        // 优先使用 member_count，如果不存在则使用 members_count
        member_count: team.member_count || team.members_count || 0,
        // 优先使用 project_count，如果不存在则使用 projects_count
        project_count: team.project_count || team.projects_count || 0,
        // 处理头像URL：优先使用 avatar_url，如果没有则使用 logo_url
        avatar_url: team.avatar_url || team.logo_url || '',
      }
      console.log('映射后的团队数据:', mappedTeam)
      return mappedTeam
    })
    
    console.log('过滤并映射后的团队列表:', teams.value)
  } catch (error) {
    console.error('加载团队列表失败:', error)
    ElMessage.error('加载团队列表失败')
    teams.value = []
  }
}

// 页面加载时获取团队列表
onMounted(() => {
  loadTeams()
})
</script>

<style scoped>
.team-list-container {
  padding: 20px;
}

.team-header {
  margin-bottom: 30px;
}

.team-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.team-subtitle {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}

.team-actions {
  display: flex;
  justify-content: flex-end;
}

/* 团队网格 */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.team-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #409eff;
}

.team-card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.team-avatar {
  flex-shrink: 0;
}

.team-info {
  flex: 1;
}

.team-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.team-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.team-menu {
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.team-menu:hover {
  color: #303133;
  background: #f5f7fa;
}

/* 团队统计 */
.team-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  margin: 16px 0;
  border-top: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-item .el-icon {
  font-size: 20px;
  color: #409eff;
}

.stat-item span {
  font-size: 12px;
  color: #606266;
}

/* 团队页脚 */
.team-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-owner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-name {
  font-size: 14px;
  color: #606266;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  padding: 60px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .team-grid {
    grid-template-columns: 1fr;
  }

  .team-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .team-menu {
    position: absolute;
    top: 20px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .team-list-container {
    padding: 16px;
  }

  .team-title {
    font-size: 20px;
  }
}
</style>
