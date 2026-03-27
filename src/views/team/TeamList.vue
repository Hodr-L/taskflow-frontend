<template>
  <div class="team-list-container">
    <div class="team-header">
      <h2 class="team-title">团队管理</h2>
      <p class="team-subtitle">创建和管理您的协作团队</p>

      <div class="team-actions">
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
              {{ team.name.substring(0, 2).toUpperCase() }}
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
            <span>{{ team.member_count }} 成员</span>
          </div>
          <div class="stat-item">
            <el-icon><Folder /></el-icon>
            <span>{{ team.project_count }} 项目</span>
          </div>
          <div class="stat-item">
            <el-icon><List /></el-icon>
            <span>{{ team.task_count }} 任务</span>
          </div>
        </div>

        <div class="team-footer">
          <div class="team-owner">
            <el-avatar :size="24" :src="team.owner_avatar">
              {{ team.owner_name.substring(0, 1).toUpperCase() }}
            </el-avatar>
            <span class="owner-name">{{ team.owner_name }}</span>
          </div>
          <el-tag :type="getRoleTagType(team.user_role)" size="small">
            {{ getRoleText(team.user_role) }}
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

        <el-form-item label="团队类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择团队类型">
            <el-option label="项目团队" value="project" />
            <el-option label="部门团队" value="department" />
            <el-option label="兴趣小组" value="interest" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="隐私设置" prop="privacy">
          <el-radio-group v-model="createForm.privacy">
            <el-radio label="public">公开（所有人可见）</el-radio>
            <el-radio label="private">私有（仅成员可见）</el-radio>
          </el-radio-group>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, More, User, Folder, List } from '@element-plus/icons-vue'

const router = useRouter()

// 团队数据
const teams = ref([
  {
    id: 1,
    name: '前端开发团队',
    description: '负责前端界面开发和用户体验优化',
    avatar_url: '',
    member_count: 8,
    project_count: 3,
    task_count: 24,
    owner_name: '张三',
    owner_avatar: '',
    user_role: 'owner',
    type: 'project',
    privacy: 'private',
    created_at: '2026-01-15',
  },
  {
    id: 2,
    name: '后端架构组',
    description: '系统架构设计和后端服务开发',
    avatar_url: '',
    member_count: 6,
    project_count: 2,
    task_count: 18,
    owner_name: '李四',
    owner_avatar: '',
    user_role: 'admin',
    type: 'department',
    privacy: 'public',
    created_at: '2026-02-10',
  },
  {
    id: 3,
    name: '产品设计小组',
    description: '产品原型设计和用户体验研究',
    avatar_url: '',
    member_count: 4,
    project_count: 1,
    task_count: 12,
    owner_name: '王五',
    owner_avatar: '',
    user_role: 'member',
    type: 'interest',
    privacy: 'private',
    created_at: '2026-03-01',
  },
])

// 创建团队表单
const showCreateDialog = ref(false)
const creating = ref(false)
const createForm = reactive({
  name: '',
  description: '',
  type: 'project',
  privacy: 'private',
})

const createRules = {
  name: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 2, max: 50, message: '团队名称长度在2到50个字符之间', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入团队描述', trigger: 'blur' },
    { max: 200, message: '团队描述不能超过200个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择团队类型', trigger: 'change' }],
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
const viewTeam = (teamId: number) => {
  router.push(`/teams/${teamId}`)
}

// 处理团队命令
const handleTeamCommand = (command: string, teamId: number) => {
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
const editTeam = (teamId: number) => {
  ElMessage.info(`编辑团队 ${teamId}`)
}

// 管理成员
const manageMembers = (teamId: number) => {
  ElMessage.info(`管理团队 ${teamId} 的成员`)
}

// 团队设置
const teamSettings = (teamId: number) => {
  ElMessage.info(`团队 ${teamId} 设置`)
}

// 删除团队
const deleteTeam = async (teamId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个团队吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // TODO: 调用删除团队的API
    teams.value = teams.value.filter((team) => team.id !== teamId)
    ElMessage.success('团队删除成功')
  } catch {
    // 用户取消
  }
}

// 创建团队
const handleCreateTeam = async () => {
  creating.value = true

  try {
    // TODO: 调用创建团队的API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newTeam = {
      id: teams.value.length + 1,
      name: createForm.name,
      description: createForm.description,
      avatar_url: '',
      member_count: 1,
      project_count: 0,
      task_count: 0,
      owner_name: '当前用户',
      owner_avatar: '',
      user_role: 'owner',
      type: createForm.type,
      privacy: createForm.privacy,
      created_at: new Date().toISOString().split('T')[0],
    }

    teams.value.unshift(newTeam)
    ElMessage.success('团队创建成功')
    showCreateDialog.value = false
    resetCreateForm()
  } catch (error) {
    ElMessage.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

// 重置创建表单
const resetCreateForm = () => {
  createForm.name = ''
  createForm.description = ''
  createForm.type = 'project'
  createForm.privacy = 'private'
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
