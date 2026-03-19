<template>
  <div class="team-detail-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button type="text" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回团队列表
      </el-button>
    </div>

    <!-- 团队头部信息 -->
    <div class="team-header">
      <div class="team-basic-info">
        <div class="team-avatar-section">
          <el-avatar :size="80" :src="team.avatar_url">
            {{ team.name?.substring(0, 2).toUpperCase() }}
          </el-avatar>
          <div class="team-avatar-actions">
            <el-button type="text" size="small" @click="showAvatarUpload = true">
              更换头像
            </el-button>
          </div>
        </div>
        
        <div class="team-info">
          <h1 class="team-name">{{ team.name }}</h1>
          <p class="team-description">{{ team.description }}</p>
          
          <div class="team-meta">
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ team.member_count || 0 }} 名成员</span>
            </div>
            <div class="meta-item">
              <el-icon><Folder /></el-icon>
              <span>{{ team.project_count || 0 }} 个项目</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>创建于 {{ formatDate(team.created_at) }}</span>
            </div>
          </div>
        </div>
        
        <div class="team-actions">
          <el-dropdown @command="handleTeamAction">
            <el-button type="primary">
              团队操作
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑团队信息</el-dropdown-item>
                <el-dropdown-item command="invite">邀请成员</el-dropdown-item>
                <el-dropdown-item command="settings">团队设置</el-dropdown-item>
                <el-dropdown-item divided command="leave" v-if="userRole !== 'owner'">退出团队</el-dropdown-item>
                <el-dropdown-item command="delete" v-if="userRole === 'owner'">解散团队</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="team-tabs">
      <el-tab-pane label="成员管理" name="members">
        <TeamMembersTab 
          :team-id="teamId"
          :members="members"
          :user-role="userRole"
          @refresh="loadTeamData"
        />
      </el-tab-pane>
      
      <el-tab-pane label="项目管理" name="projects">
        <TeamProjectsTab 
          :team-id="teamId"
          :projects="projects"
          :user-role="userRole"
        />
      </el-tab-pane>
      
      <el-tab-pane label="团队设置" name="settings">
        <TeamSettingsTab 
          :team="team"
          :user-role="userRole"
          @update-team="handleTeamUpdate"
        />
      </el-tab-pane>
      
      <el-tab-pane label="活动日志" name="activity">
        <TeamActivityTab :team-id="teamId" />
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑团队对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑团队信息"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item label="团队名称" prop="name">
          <el-input
            v-model="editForm.name"
            placeholder="请输入团队名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="团队描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入团队描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="隐私设置" prop="privacy">
          <el-radio-group v-model="editForm.privacy">
            <el-radio label="public">公开（所有人可见）</el-radio>
            <el-radio label="private">私有（仅成员可见）</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="updating"
            @click="handleUpdateTeam"
          >
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 邀请成员对话框 -->
    <el-dialog
      v-model="showInviteDialog"
      title="邀请成员"
      width="500px"
    >
      <el-form
        ref="inviteFormRef"
        :model="inviteForm"
        :rules="inviteRules"
        label-width="80px"
      >
        <el-form-item label="邮箱地址" prop="email">
          <el-input
            v-model="inviteForm.email"
            placeholder="请输入要邀请的成员邮箱"
          />
        </el-form-item>

        <el-form-item label="成员角色" prop="role">
          <el-select v-model="inviteForm.role" placeholder="请选择成员角色">
            <el-option label="成员" value="member" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item label="邀请消息" prop="message">
          <el-input
            v-model="inviteForm.message"
            type="textarea"
            :rows="3"
            placeholder="可选的邀请消息"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showInviteDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="inviting"
            @click="handleInviteMember"
          >
            发送邀请
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  ArrowDown, 
  User, 
  Folder, 
  Calendar 
} from '@element-plus/icons-vue'

// 导入子组件
import TeamMembersTab from './components/TeamMembersTab.vue'
import TeamProjectsTab from './components/TeamProjectsTab.vue'
import TeamSettingsTab from './components/TeamSettingsTab.vue'
import TeamActivityTab from './components/TeamActivityTab.vue'
import type { Team } from '../../types/team'

const route = useRoute()
const router = useRouter()
const teamId = ref(Number(route.params.id))

// 团队数据
const team = ref<Team>({
  id: teamId.value,
  name: '前端开发团队',
  description: '负责前端界面开发和用户体验优化',
  avatar_url: '',
  member_count: 8,
  project_count: 3,
  owner_id: 1,
  privacy: 'private',
  created_at: '2026-01-15T10:30:00Z'
})

// 用户角色（当前用户在团队中的角色）
const userRole = ref<'owner' | 'admin' | 'member'>('owner') // owner|admin|member

// 成员数据
const members = ref([
  {
    id: 1,
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    full_name: '张三',
    avatar_url: '',
    role: 'owner',
    joined_at: '2026-01-15T10:30:00Z'
  },
  {
    id: 2,
    username: 'lisi',
    email: 'lisi@example.com',
    full_name: '李四',
    avatar_url: '',
    role: 'admin',
    joined_at: '2026-01-20T14:15:00Z'
  },
  {
    id: 3,
    username: 'wangwu',
    email: 'wangwu@example.com',
    full_name: '王五',
    avatar_url: '',
    role: 'member',
    joined_at: '2026-02-01T09:00:00Z'
  }
])

// 项目数据
const projects = ref([
  {
    id: 1,
    name: 'TaskFlow 前端开发',
    description: '任务管理系统前端界面开发',
    status: 'active',
    task_count: 24,
    completed_tasks: 12,
    progress: 50,
    start_date: '2026-01-20',
    end_date: '2026-03-20'
  },
  {
    id: 2,
    name: '用户中心重构',
    description: '用户中心模块重构和优化',
    status: 'active',
    task_count: 18,
    completed_tasks: 9,
    progress: 50,
    start_date: '2026-02-01',
    end_date: '2026-03-15'
  }
])

// 状态
const activeTab = ref('members')
const showEditDialog = ref(false)
const showInviteDialog = ref(false)
const showAvatarUpload = ref(false)
const updating = ref(false)
const inviting = ref(false)

// 编辑表单
const editForm = reactive({
  name: team.value.name,
  description: team.value.description,
  privacy: team.value.privacy
})

const editRules = {
  name: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 2, max: 50, message: '团队名称长度在2到50个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入团队描述', trigger: 'blur' },
    { max: 200, message: '团队描述不能超过200个字符', trigger: 'blur' }
  ]
}

// 邀请表单
const inviteForm = reactive({
  email: '',
  role: 'member',
  message: ''
})

const inviteRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择成员角色', trigger: 'change' }
  ]
}

// 生命周期
onMounted(() => {
  loadTeamData()
})

// 加载团队数据
const loadTeamData = async () => {
  try {
    // TODO: 调用API获取团队数据
    // const response = await teamApi.getTeamDetail(teamId.value)
    // team.value = response.data.team
    // members.value = response.data.members
    // projects.value = response.data.projects
    // userRole.value = response.data.user_role
    
    console.log('加载团队数据:', teamId.value)
  } catch (error) {
    ElMessage.error('加载团队数据失败')
  }
}

// 返回团队列表
const goBack = () => {
  router.push('/teams')
}

// 处理团队操作
const handleTeamAction = (command: string) => {
  switch (command) {
    case 'edit':
      showEditDialog.value = true
      break
    case 'invite':
      showInviteDialog.value = true
      break
    case 'settings':
      activeTab.value = 'settings'
      break
    case 'leave':
      handleLeaveTeam()
      break
    case 'delete':
      handleDeleteTeam()
      break
  }
}

// 更新团队信息
const handleUpdateTeam = async () => {
  updating.value = true
  
  try {
    // TODO: 调用更新团队的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    team.value.name = editForm.name
    team.value.description = editForm.description
    team.value.privacy = editForm.privacy
    
    ElMessage.success('团队信息更新成功')
    showEditDialog.value = false
  } catch (error) {
    ElMessage.error('更新失败，请重试')
  } finally {
    updating.value = false
  }
}

// 邀请成员
const handleInviteMember = async () => {
  inviting.value = true
  
  try {
    // TODO: 调用邀请成员的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('邀请已发送')
    showInviteDialog.value = false
    inviteForm.email = ''
    inviteForm.message = ''
  } catch (error) {
    ElMessage.error('邀请失败，请重试')
  } finally {
    inviting.value = false
  }
}

// 退出团队
const handleLeaveTeam = async () => {
  try {
    await ElMessageBox.confirm('确定要退出这个团队吗？', '确认退出', {
      confirmButtonText: '确定退出',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // TODO: 调用退出团队的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('已退出团队')
    router.push('/teams')
  } catch {
    // 用户取消
  }
}

// 解散团队
const handleDeleteTeam = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要解散这个团队吗？此操作将删除团队所有数据且不可恢复。',
      '确认解散',
      {
        confirmButtonText: '确定解散',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // TODO: 调用解散团队的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('团队已解散')
    router.push('/teams')
  } catch {
    // 用户取消
  }
}

// 处理团队更新
const handleTeamUpdate = (updatedTeam: any) => {
  team.value = { ...team.value, ...updatedTeam }
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.team-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 20px;
}

.team-header {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.team-basic-info {
  display: flex;
  align-items: flex-start;
  gap: 30px;
}

.team-avatar-section {
  flex-shrink: 0;
  text-align: center;
}

.team-avatar-actions {
  margin-top: 12px;
}

.team-info {
  flex: 1;
}

.team-name {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.team-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
}

.team-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.meta-item .el-icon {
  font-size: 16px;
}

.team-actions {
  flex-shrink: 0;
}

.team-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

:deep(.el-tabs__header) {
  margin-bottom: 24px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .team-detail-container {
    padding: 16px;
  }
  
  .team-basic-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }
  
  .team-meta {
    justify-content: center;
  }
  
  .team-actions {
    width: 100%;
  }
  
  .team-actions .el-dropdown {
    width: 100%;
  }
  
  .team-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .team-header {
    padding: 20px;
  }
  
  .team-name {
    font-size: 24px;
  }
  
  .team-description {
    font-size: 14px;
  }
}
</style>