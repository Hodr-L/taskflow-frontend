<template>
  <div class="team-detail-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button type="link" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回团队列表
      </el-button>
    </div>

    <!-- 团队头部信息 -->
    <div class="team-header">
      <div class="team-basic-info">
        <div class="team-avatar-section">
          <el-avatar :size="80" :src="team.avatar_url">
            {{ team.name ? team.name.substring(0, 2).toUpperCase() : '??' }}
          </el-avatar>
          <div class="team-avatar-actions">
            <el-button type="link" size="small" @click="showAvatarUpload = true">
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
                <el-dropdown-item divided command="leave" v-if="userRole !== 'owner'"
                  >退出团队</el-dropdown-item
                >
                <el-dropdown-item command="delete" v-if="userRole === 'owner'"
                  >解散团队</el-dropdown-item
                >
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
        <TeamProjectsTab :team-id="teamId" :projects="projects" :user-role="userRole" />
      </el-tab-pane>

      <el-tab-pane label="团队设置" name="settings">
        <TeamSettingsTab :team="team" :user-role="userRole" @update-team="handleTeamUpdate" />
      </el-tab-pane>

      <el-tab-pane label="活动日志" name="activity">
        <TeamActivityTab :team-id="teamId" />
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑团队对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑团队信息" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
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
          <el-button type="primary" :loading="updating" @click="handleUpdateTeam">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 邀请成员对话框 -->
    <el-dialog v-model="showInviteDialog" title="邀请成员" width="500px">
      <el-form ref="inviteFormRef" :model="inviteForm" :rules="inviteRules" label-width="80px">
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="inviteForm.email" placeholder="请输入要邀请的成员邮箱" />
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
          <el-button type="primary" :loading="inviting" @click="handleInviteMember">
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
import { ArrowLeft, ArrowDown, User, Folder, Calendar } from '@element-plus/icons-vue'

// 导入子组件
import TeamMembersTab from './components/TeamMembersTab.vue'
import TeamProjectsTab from './components/TeamProjectsTab.vue'
import TeamSettingsTab from './components/TeamSettingsTab.vue'
import TeamActivityTab from './components/TeamActivityTab.vue'
import type { Team } from '../../types/team'
import type { Member } from '../../types/member'

// 导入API
import { getTeamById, updateTeam, deleteTeam as deleteTeamApi, inviteTeamMember, leaveTeam } from '../../services/team'
import { http } from '../../services/api'

const route = useRoute()
const router = useRouter()
const teamId = ref(route.params.id as string)

// 团队数据
const team = ref<Team>({
  id: teamId.value,
  name: '',
  description: '',
  avatar_url: '',
  member_count: 0,
  project_count: 0,
  owner_id: '',
  privacy: 'private',
  created_at: '',
})

// 用户角色（当前用户在团队中的角色）
const userRole = ref<'owner' | 'admin' | 'member'>('member') // owner|admin|member，默认为member，等API返回后更新

// 成员数据
const members = ref<Member[]>([])

// 项目数据
const projects = ref([])

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
  privacy: team.value.privacy,
})

const editRules = {
  name: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 2, max: 50, message: '团队名称长度在2到50个字符之间', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入团队描述', trigger: 'blur' },
    { max: 200, message: '团队描述不能超过200个字符', trigger: 'blur' },
  ],
}

// 邀请表单
const inviteForm = reactive({
  email: '',
  role: 'member',
  message: '',
})

const inviteRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择成员角色', trigger: 'change' }],
}

// 生命周期
onMounted(() => {
  loadTeamData()
})

// 加载团队数据
const loadTeamData = async () => {
  try {
    console.log('加载团队数据:', teamId.value)
    
    // 调用API获取团队详情
    const response = await http.get(`/teams/${teamId.value}`)
    console.log('团队详情响应:', response)
    
    // 根据后端API响应格式，response包含team、members、projects字段
    if (response && typeof response === 'object') {
      // team字段
      if (response.team) {
        console.log('团队字段:', response.team)
        console.log('团队member_count:', response.team.member_count)
        console.log('团队logo_url:', response.team.logo_url)
        console.log('团队avatar_url:', response.team.avatar_url)
        
        team.value = {
          ...response.team,
          // 确保avatar_url是字符串，如果后端返回logo_url，将其映射到avatar_url
          avatar_url: response.team.avatar_url || response.team.logo_url || '',
          // 确保member_count有值，优先使用后端返回的member_count，其次使用members_count，最后从members数组长度推导
          member_count: response.team.member_count || response.team.members_count || (response.members ? response.members.length : 0),
          // 确保project_count有值，优先使用后端返回的project_count，其次使用projects_count，最后从projects数组长度推导
          project_count: response.team.project_count || response.team.projects_count || (response.projects ? response.projects.length : 0)
        }
        // 同步编辑表单
        editForm.name = team.value.name
        editForm.description = team.value.description
        editForm.privacy = team.value.privacy || 'private'
      }
      
      // members字段
      if (response.members && Array.isArray(response.members)) {
        console.log('成员列表:', response.members)
        console.log('成员数量:', response.members.length)
        members.value = response.members
      } else {
        console.warn('members字段不存在或不是数组:', response.members)
      }
      
      // projects字段  
      if (response.projects && Array.isArray(response.projects)) {
        projects.value = response.projects
      }
      
      // 用户角色（假设响应中有user_role字段，如果没有则默认为成员）
      // 这里需要根据实际情况调整，可能需要额外的API调用获取当前用户在团队中的角色
      userRole.value = response.user_role || 'member'
    } else {
      console.warn('无效的团队详情响应格式:', response)
      ElMessage.warning('获取团队数据格式异常')
    }
  } catch (error) {
    console.error('加载团队数据失败:', error)
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
    console.log('更新团队信息:', teamId.value, editForm)
    
    // 调用更新团队的API
    const response = await updateTeam(teamId.value, {
      name: editForm.name,
      description: editForm.description,
      privacy: editForm.privacy
    })
    
    console.log('更新团队响应:', response)
    
    // 更新本地数据
    team.value.name = editForm.name
    team.value.description = editForm.description
    team.value.privacy = editForm.privacy

    ElMessage.success('团队信息更新成功')
    showEditDialog.value = false
  } catch (error) {
    console.error('更新团队失败:', error)
    
    // 检查是否是已知的500错误
    if (error?.status === 500) {
      ElMessage.warning('团队更新接口当前不可用，已保存本地修改')
      // 即使API失败，也保存本地修改
      team.value.name = editForm.name
      team.value.description = editForm.description
      team.value.privacy = editForm.privacy
      showEditDialog.value = false
    } else {
      ElMessage.error('更新失败，请重试')
    }
  } finally {
    updating.value = false
  }
}

// 邀请成员
const handleInviteMember = async () => {
  inviting.value = true

  try {
    console.log('邀请成员:', teamId.value, inviteForm)
    
    // 调用邀请成员的API
    const response = await inviteTeamMember(teamId.value, {
      email: inviteForm.email,
      role: inviteForm.role as 'admin' | 'member',
      message: inviteForm.message
    })
    
    console.log('邀请成员响应:', response)
    
    ElMessage.success('邀请已发送')
    showInviteDialog.value = false
    // 重置表单
    inviteForm.email = ''
    inviteForm.message = ''
    inviteForm.role = 'member'
    
    // 重新加载团队数据以更新成员列表
    loadTeamData()
  } catch (error) {
    console.error('邀请成员失败:', error)
    ElMessage.error(`邀请失败: ${error.message || '请重试'}`)
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
      type: 'warning',
    })

    console.log('退出团队:', teamId.value)
    
    // 调用退出团队的API
    try {
      await leaveTeam(teamId.value)
      console.log('退出团队API调用成功')
    } catch (apiError) {
      console.error('退出团队API调用失败:', apiError)
      // 检查是否是204 No Content
      if (apiError?.status === 204) {
        console.log('API返回204 No Content，表示退出成功')
      } else {
        // 重新抛出错误
        throw apiError
      }
    }

    ElMessage.success('已退出团队')
    router.push('/teams')
  } catch (error) {
    if (error !== 'cancel') { // 用户取消不是错误
      console.error('退出团队失败:', error)
      ElMessage.error('退出团队失败，请重试')
    }
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
        type: 'error',
      },
    )

    console.log('解散团队:', teamId.value)
    
    // 调用解散团队的API
    try {
      await deleteTeamApi(teamId.value)
      console.log('解散团队API调用成功')
    } catch (apiError) {
      console.error('解散团队API调用失败:', apiError)
      // 检查是否是204 No Content
      if (apiError?.status === 204) {
        console.log('API返回204 No Content，表示解散成功')
      } else {
        // 重新抛出错误
        throw apiError
      }
    }

    ElMessage.success('团队已解散')
    router.push('/teams')
  } catch (error) {
    if (error !== 'cancel') { // 用户取消不是错误
      console.error('解散团队失败:', error)
      ElMessage.error('解散团队失败，请重试')
    }
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
