<template>
  <div class="team-members-tab">
    <!-- 鎴愬憳绠＄悊澶撮儴 -->
    <div class="members-header">
      <div class="header-left">
        <h3>鍥㈤槦鎴愬憳</h3>
        <p class="member-count">鍏?{{ members.length }} 鍚嶆垚鍛?/p>
      </div>

      <div class="header-right" v-if="userRole === 'owner' || userRole === 'admin'">
        <el-button type="primary" @click="$emit('invite')">
          <el-icon><Plus /></el-icon>
          閭€璇锋垚鍛?        </el-button>
      </div>
    </div>

    <!-- 鎴愬憳鎼滅储鍜岀瓫閫?-->
    <div class="members-filter">
      <el-input
        v-model="searchKeyword"
        placeholder="鎼滅储鎴愬憳濮撳悕鎴栭偖绠?
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterRole" placeholder="绛涢€夎鑹? class="role-filter" clearable>
        <el-option label="鍏ㄩ儴" value="" />
        <el-option label="鍒涘缓鑰? value="owner" />
        <el-option label="绠＄悊鍛? value="admin" />
        <el-option label="鎴愬憳" value="member" />
      </el-select>
    </div>

    <!-- 鎴愬憳鍒楄〃 -->
    <div class="members-list">
      <el-table :data="filteredMembers" style="width: 100%" empty-text="鏆傛棤鎴愬憳">
        <el-table-column label="鎴愬憳" width="300">
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

        <el-table-column label="瑙掕壊" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" size="small">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="鍔犲叆鏃堕棿" width="180">
          <template #default="{ row }">
            {{ formatDate(row.joined_at) }}
          </template>
        </el-table-column>

        <el-table-column
          label="鎿嶄綔"
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
                  绠＄悊
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="change-role">鏇存敼瑙掕壊</el-dropdown-item>
                    <el-dropdown-item divided command="remove">绉婚櫎鎴愬憳</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <span v-else class="no-actions">-</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 鏇存敼瑙掕壊瀵硅瘽妗?-->
    <el-dialog v-model="showRoleDialog" title="鏇存敼鎴愬憳瑙掕壊" width="400px">
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
            <el-radio label="admin">绠＄悊鍛?/el-radio>
            <el-radio label="member">鏅€氭垚鍛?/el-radio>
          </el-radio-group>
          <p class="role-description">
            {{ getRoleDescription(newRole) }}
          </p>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRoleDialog = false">鍙栨秷</el-button>
          <el-button type="primary" :loading="changingRole" @click="handleChangeRole">
            纭鏇存敼
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

// 鐘舵€?const searchKeyword = ref('')
const filterRole = ref('')
const showRoleDialog = ref(false)
const changingRole = ref(false)
const selectedMember = ref<Member | null>(null)
const newRole = ref<'admin' | 'member'>('member')

// 杩囨护鍚庣殑鎴愬憳鍒楄〃
const filteredMembers = computed(() => {
  return props.members.filter((member) => {
    // 鎼滅储杩囨护
    const keyword = searchKeyword.value.toLowerCase()
    const matchesSearch =
      !keyword ||
      member.full_name?.toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword)

    // 瑙掕壊杩囨护
    const matchesRole = !filterRole.value || member.role === filterRole.value

    return matchesSearch && matchesRole
  })
})

// 鑾峰彇瑙掕壊鏍囩绫诲瀷
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

// 鑾峰彇瑙掕壊鏂囨湰
const getRoleText = (role: string) => {
  switch (role) {
    case 'owner':
      return '鍒涘缓鑰?
    case 'admin':
      return '绠＄悊鍛?
    default:
      return '鎴愬憳'
  }
}

// 鑾峰彇瑙掕壊鎻忚堪
const getRoleDescription = (role: string) => {
  switch (role) {
    case 'owner':
      return '鎷ユ湁鍥㈤槦鎵€鏈夋潈闄愶紝鍖呮嫭瑙ｆ暎鍥㈤槦'
    case 'admin':
      return '鍙互绠＄悊鍥㈤槦鎴愬憳鍜岄」鐩紝浣嗕笉鑳借В鏁ｅ洟闃?
    default:
      return '鍙互鏌ョ湅鍥㈤槦淇℃伅锛屽弬涓庨」鐩崗浣?
  }
}

// 鏍煎紡鍖栨棩鏈?const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 澶勭悊鎴愬憳鍛戒护
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

// 鏇存敼鎴愬憳瑙掕壊
const handleChangeRole = async () => {
  if (!selectedMember.value) return

  changingRole.value = true

  try {
    // TODO: 璋冪敤API鏇存敼鎴愬憳瑙掕壊
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 鏇存柊鏈湴鏁版嵁
    const memberIndex = props.members.findIndex((m) => m.id === selectedMember.value!.id)
    if (memberIndex !== -1) {
      props.members[memberIndex].role = newRole.value as 'admin' | 'member' | 'owner'
    }

    ElMessage.success('瑙掕壊鏇存敼鎴愬姛')
    showRoleDialog.value = false
    emit('refresh')
  } catch (error) {
    ElMessage.error('鏇存敼澶辫触锛岃閲嶈瘯')
  } finally {
    changingRole.value = false
  }
}

// 绉婚櫎鎴愬憳
const handleRemoveMember = async (member: Member) => {
  try {
    await ElMessageBox.confirm(`纭畾瑕佸皢 ${member.full_name} 浠庡洟闃熶腑绉婚櫎鍚楋紵`, '纭绉婚櫎', {
      confirmButtonText: '纭畾绉婚櫎',
      cancelButtonText: '鍙栨秷',
      type: 'warning',
    })

    // TODO: 璋冪敤API绉婚櫎鎴愬憳
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 鏇存柊鏈湴鏁版嵁
    const memberIndex = props.members.findIndex((m) => m.id === member.id)
    if (memberIndex !== -1) {
      props.members.splice(memberIndex, 1)
    }

    ElMessage.success('鎴愬憳绉婚櫎鎴愬姛')
    emit('refresh')
  } catch {
    // 鐢ㄦ埛鍙栨秷
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

/* 瑙掕壊瀵硅瘽妗嗗唴瀹?*/
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

/* 琛ㄦ牸鏍峰紡 */
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

/* 鍝嶅簲寮忚璁?*/
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
