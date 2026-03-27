<template>
  <div class="team-members-tab">
    <!-- 成员管理头部 -->
    <div class="members-header">
      <div class="header-left">
        <h3>团队成员</h3>
        <p class="member-count">共 {{ members.length }} 名成员</p>
      </div>

      <div class="header-right" v-if="userRole === 'owner' || userRole === 'admin'">
        <el-button type="primary" @click="$emit('invite')">
          <el-icon><Plus /></el-icon>
          邀请成员
        </el-button>
      </div>
    </div>

    <!-- 成员搜索和筛选 -->
    <div class="members-filter">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索成员姓名或邮箱"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterRole" placeholder="筛选角色" class="role-filter" clearable>
        <el-option label="全部" value="" />
        <el-option label="创建者" value="owner" />
        <el-option label="管理员" value="admin" />
        <el-option label="成员" value="member" />
      </el-select>
    </div>

    <!-- 成员列表 -->
    <div class="members-list">
      <el-table :data="filteredMembers" style="width: 100%" empty-text="暂无成员">
        <el-table-column label="成员" width="300">
          <template #default="{ row }">
            <div class="member-info">
              <el-avatar :size="40" :src="row.avatar_url">
                {{ row.full_name?.substring(0, 1).toUpperCase() }}
              </el-avatar>
              <div class="member-details">
                <div class="member-name">{{ row.full_name }}</div>
                <div class="member-email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" size="small">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="加入时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.joined_at) }}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="200"
          v-if="userRole === 'owner' || userRole === 'admin'"
        >
          <template #default="{ row }">
            <div class="member-actions">
              <el-dropdown
                v-if="
                  row.role !== 'owner' &&
                  (userRole === 'owner' || (userRole === 'admin' && row.role !== 'admin'))
                "
                @command="(command: string) => handleMemberCommand(command, row)"
              >
                <el-button type="text" size="small">
                  管理
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="change-role">更改角色</el-dropdown-item>
                    <el-dropdown-item divided command="remove">移除成员</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <span v-else class="no-actions">-</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 更改角色对话框 -->
    <el-dialog v-model="showRoleDialog" title="更改成员角色" width="400px">
      <div class="role-dialog-content">
        <div class="member-info">
          <el-avatar :size="48" :src="selectedMember?.avatar_url">
            {{ selectedMember?.full_name?.substring(0, 1).toUpperCase() }}
          </el-avatar>
          <div class="member-details">
            <div class="member-name">{{ selectedMember?.full_name }}</div>
            <div class="member-email">{{ selectedMember?.email }}</div>
          </div>
        </div>

        <div class="role-selection">
          <el-radio-group v-model="newRole">
            <el-radio label="admin">管理员</el-radio>
            <el-radio label="member">普通成员</el-radio>
          </el-radio-group>
          <p class="role-description">
            {{ getRoleDescription(newRole) }}
          </p>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRoleDialog = false">取消</el-button>
          <el-button type="primary" :loading="changingRole" @click="handleChangeRole">
            确认更改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, ArrowDown } from '@element-plus/icons-vue'
import type { Member } from '@/types/member'

interface Props {
  teamId: number
  members: Member[]
  userRole: string
}

const props = defineProps<Props>()
const emit = defineEmits(['refresh', 'invite'])

// 状态
const searchKeyword = ref('')
const filterRole = ref('')
const showRoleDialog = ref(false)
const changingRole = ref(false)
const selectedMember = ref<Member | null>(null)
const newRole = ref<'admin' | 'member'>('member')

// 过滤后的成员列表
const filteredMembers = computed(() => {
  return props.members.filter((member) => {
    // 搜索过滤
    const keyword = searchKeyword.value.toLowerCase()
    const matchesSearch =
      !keyword ||
      member.full_name?.toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword)

    // 角色过滤
    const matchesRole = !filterRole.value || member.role === filterRole.value

    return matchesSearch && matchesRole
  })
})

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

// 获取角色描述
const getRoleDescription = (role: string) => {
  switch (role) {
    case 'owner':
      return '拥有团队所有权限，包括解散团队'
    case 'admin':
      return '可以管理团队成员和项目，但不能解散团队'
    default:
      return '可以查看团队信息，参与项目协作'
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 处理成员命令
const handleMemberCommand = (command: string, member: Member) => {
  selectedMember.value = member

  switch (command) {
    case 'change-role':
      newRole.value = member.role === 'admin' ? 'member' : 'admin'
      showRoleDialog.value = true
      break
    case 'remove':
      handleRemoveMember(member)
      break
  }
}

// 更改成员角色
const handleChangeRole = async () => {
  if (!selectedMember.value) return

  changingRole.value = true

  try {
    // TODO: 调用API更改成员角色
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 更新本地数据
    const memberIndex = props.members.findIndex((m) => m.id === selectedMember.value!.id)
    if (memberIndex !== -1) {
      props.members[memberIndex].role = newRole.value as 'admin' | 'member' | 'owner'
    }

    ElMessage.success('角色更改成功')
    showRoleDialog.value = false
    emit('refresh')
  } catch (error) {
    ElMessage.error('更改失败，请重试')
  } finally {
    changingRole.value = false
  }
}

// 移除成员
const handleRemoveMember = async (member: Member) => {
  try {
    await ElMessageBox.confirm(`确定要将 ${member.full_name} 从团队中移除吗？`, '确认移除', {
      confirmButtonText: '确定移除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // TODO: 调用API移除成员
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 更新本地数据
    const memberIndex = props.members.findIndex((m) => m.id === member.id)
    if (memberIndex !== -1) {
      props.members.splice(memberIndex, 1)
    }

    ElMessage.success('成员移除成功')
    emit('refresh')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.team-members-tab {
  padding: 20px 0;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.member-count {
  font-size: 14px;
  color: #909399;
}

.members-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.role-filter {
  width: 150px;
}

.members-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-details {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.member-email {
  font-size: 12px;
  color: #909399;
}

.member-actions {
  display: flex;
  align-items: center;
}

.no-actions {
  color: #909399;
  font-size: 14px;
}

/* 角色对话框内容 */
.role-dialog-content {
  padding: 20px 0;
}

.role-dialog-content .member-info {
  margin-bottom: 30px;
}

.role-selection {
  margin-top: 20px;
}

.role-description {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table__header) {
  background: #f5f7fa;
}

:deep(.el-table th) {
  background: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .members-filter {
    flex-direction: column;
  }

  .search-input {
    max-width: 100%;
  }

  .role-filter {
    width: 100%;
  }

  .member-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .members-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-right {
    width: 100%;
  }

  .header-right .el-button {
    width: 100%;
  }
}
</style>
