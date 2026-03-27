<template>
  <div class="user-list-container">
    <div class="user-header">
      <h2 class="user-title">鐢ㄦ埛绠＄悊</h2>
      <p class="user-subtitle">绠＄悊绯荤粺鐢ㄦ埛锛屽垎閰嶈鑹插拰鏉冮檺</p>
      
      <div class="user-actions">
        <el-button type="primary" size="large" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          娣诲姞鐢ㄦ埛
        </el-button>
        <el-button :icon="Refresh" @click="refreshUsers">鍒锋柊</el-button>
        <el-button :icon="Download" @click="exportUsers">瀵煎嚭</el-button>
      </div>
    </div>

    <!-- 杩囨护鍜屾悳绱?-->
    <div class="user-filters">
      <el-input
        v-model="searchText"
        placeholder="鎼滅储鐢ㄦ埛鍚嶃€侀偖绠辨垨濮撳悕"
        clearable
        class="search-input"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="filterRole" placeholder="瑙掕壊" clearable @change="handleFilter" multiple>
        <el-option label="鏅€氱敤鎴? value="user" />
        <el-option label="绠＄悊鍛? value="admin" />
        <el-option label="瓒呯骇绠＄悊鍛? value="super_admin" />
      </el-select>
      
      <el-select v-model="filterStatus" placeholder="鐘舵€? clearable @change="handleFilter">
        <el-option label="娲昏穬" value="active" />
        <el-option label="鏈縺娲? value="inactive" />
        <el-option label="绂佺敤" value="banned" />
      </el-select>
      
      <el-select v-model="filterEmailVerified" placeholder="閭楠岃瘉" clearable @change="handleFilter">
        <el-option label="宸查獙璇? :value="true" />
        <el-option label="鏈獙璇? :value="false" />
      </el-select>
    </div>

    <!-- 鐢ㄦ埛缁熻 -->
    <div class="user-stats">
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <span class="stat-number">{{ userStats.total || 0 }}</span>
          <span class="stat-label">鎬荤敤鎴锋暟</span>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <span class="stat-number" style="color: #67c23a;">{{ userStats.active || 0 }}</span>
          <span class="stat-label">娲昏穬鐢ㄦ埛</span>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <span class="stat-number" style="color: #e6a23c;">{{ (userStats.admin || 0) + (userStats.super_admin || 0) }}</span>
          <span class="stat-label">绠＄悊鍛?/span>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-content">
          <span class="stat-number" style="color: #909399;">{{ userStats.unverified || 0 }}</span>
          <span class="stat-label">鏈獙璇?/span>
        </div>
      </el-card>
    </div>

    <!-- 鐢ㄦ埛琛ㄦ牸 -->
    <el-card class="user-table-card">
      <el-table
        :data="filteredUsers"
        style="width: 100%"
        @row-click="viewUser"
        :row-class-name="tableRowClassName"
        v-loading="loading"
      >
        <el-table-column label="鐢ㄦ埛" min-width="200">
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
        
        <el-table-column label="瑙掕壊" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" size="small" effect="light">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="鐘舵€? width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small" effect="light">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="閭楠岃瘉" width="100">
          <template #default="{ row }">
            <el-tag :type="row.email_verified ? 'success' : 'warning'" size="small">
              {{ row.email_verified ? '宸查獙璇? : '鏈獙璇? }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="鏈€鍚庣櫥褰? width="180">
          <template #default="{ row }">
            <span>{{ formatDate(row.last_login_at) || '浠庢湭鐧诲綍' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="鍒涘缓鏃堕棿" width="180">
          <template #default="{ row }">
            <span>{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="鎿嶄綔" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="viewUser(row.id)">鏌ョ湅</el-button>
            <el-button type="info" link size="small" @click.stop="editUser(row)">缂栬緫</el-button>
            <el-button 
              v-if="row.status === 'active'" 
              type="warning" 
              link 
              size="small" 
              @click.stop="disableUser(row)"
            >
              绂佺敤
            </el-button>
            <el-button 
              v-else 
              type="success" 
              link 
              size="small" 
              @click.stop="enableUser(row)"
            >
              鍚敤
            </el-button>
            <el-button 
              v-if="currentUser?.id !== row.id && row.role !== 'super_admin'" 
              type="danger" 
              link 
              size="small" 
              @click.stop="deleteUser(row)"
            >
              鍒犻櫎
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 鍒嗛〉 -->
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

    <!-- 鍒涘缓/缂栬緫鐢ㄦ埛瀵硅瘽妗?-->
    <el-dialog
      v-model="showUserDialog"
      :title="editingUser ? '缂栬緫鐢ㄦ埛' : '娣诲姞鐢ㄦ埛'"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="80px"
      >
        <el-form-item label="鐢ㄦ埛鍚? prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="璇疯緭鍏ョ敤鎴峰悕"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="閭" prop="email">
          <el-input
            v-model="userForm.email"
            type="email"
            placeholder="璇疯緭鍏ラ偖绠?
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item v-if="!editingUser" label="瀵嗙爜" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="璇疯緭鍏ュ瘑鐮?
            show-password
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item label="濮撳悕" prop="fullname">
          <el-input
            v-model="userForm.fullname"
            placeholder="璇疯緭鍏ュ鍚?
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item label="鑱屼綅/绠€浠? prop="bio">
          <el-input
            v-model="userForm.bio"
            placeholder="璇疯緭鍏ヨ亴浣嶆垨绠€浠?
            maxlength="255"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="瑙掕壊" prop="role">
              <el-select v-model="userForm.role" placeholder="璇烽€夋嫨瑙掕壊" style="width: 100%">
                <el-option label="鏅€氱敤鎴? value="user" />
                <el-option label="绠＄悊鍛? value="admin" />
                <el-option label="瓒呯骇绠＄悊鍛? value="super_admin" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="鐘舵€? prop="status">
              <el-select v-model="userForm.status" placeholder="璇烽€夋嫨鐘舵€? style="width: 100%">
                <el-option label="娲昏穬" value="active" />
                <el-option label="鏈縺娲? value="inactive" />
                <el-option label="绂佺敤" value="banned" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="澶村儚URL" prop="avatar_url">
          <el-input
            v-model="userForm.avatar_url"
            placeholder="璇疯緭鍏ュご鍍廢RL"
            maxlength="255"
          />
          <div class="avatar-preview" v-if="userForm.avatar_url">
            <el-avatar :size="60" :src="userForm.avatar_url">
              {{ (userForm.username || 'U').substring(0, 1).toUpperCase() }}
            </el-avatar>
          </div>
        </el-form-item>
        
        <el-form-item label="閭楠岃瘉" prop="email_verified">
          <el-switch
            v-model="userForm.email_verified"
            active-text="宸查獙璇?
            inactive-text="鏈獙璇?
          />
        </el-form-item>
        
        <el-form-item v-if="editingUser" label="閲嶇疆瀵嗙爜" prop="reset_password">
          <el-switch
            v-model="userForm.reset_password"
            active-text="閲嶇疆瀵嗙爜"
            inactive-text="淇濇寔鍘熷瘑鐮?
            @change="handleResetPasswordChange"
          />
        </el-form-item>
        
        <el-form-item 
          v-if="editingUser && userForm.reset_password" 
          label="鏂板瘑鐮? 
          prop="new_password"
        >
          <el-input
            v-model="userForm.new_password"
            type="password"
            placeholder="璇疯緭鍏ユ柊瀵嗙爜"
            show-password
            maxlength="100"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">鍙栨秷</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingUser ? '鏇存柊' : '鍒涘缓' }}
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

// 褰撳墠鐧诲綍鐢ㄦ埛
const currentUser = computed(() => authStore.user)

// 鍝嶅簲寮忔暟鎹?const users = ref<User[]>([])
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
    { required: true, message: '璇疯緭鍏ョ敤鎴峰悕', trigger: 'blur' },
    { min: 3, max: 50, message: '闀垮害鍦?3 鍒?50 涓瓧绗?, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '璇疯緭鍏ラ偖绠?, trigger: 'blur' },
    { type: 'email', message: '璇疯緭鍏ユ纭殑閭鍦板潃', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '璇疯緭鍏ュ瘑鐮?, trigger: 'blur' },
    { min: 6, max: 100, message: '闀垮害鍦?6 鍒?100 涓瓧绗?, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '璇烽€夋嫨瑙掕壊', trigger: 'change' }
  ],
  status: [
    { required: true, message: '璇烽€夋嫨鐘舵€?, trigger: 'change' }
  ]
}

// 璁＄畻灞炴€?// 娉ㄦ剰锛氳繃婊ょ幇鍦ㄧ敱鍚庣API澶勭悊锛岃繖閲岀洿鎺ヨ繑鍥炵敤鎴峰垪琛?const filteredUsers = computed(() => {
  return users.value
})

// 鍔犺浇鐢ㄦ埛鏁版嵁
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
    // api.ts鎷︽埅鍣ㄨ繑鍥瀝esponse.data.data锛屾墍浠esponse鐩存帴灏辨槸UsersData
    users.value = response.users || []
    totalUsers.value = response.pagination?.total || 0
  } catch (error: any) {
    console.error('鍔犺浇鐢ㄦ埛鍒楄〃澶辫触:', error)
    if (error.code === 403) {
      ElMessage.error('鏉冮檺涓嶈冻锛屾棤娉曡闂敤鎴风鐞?)
      router.push('/dashboard')
    } else {
      ElMessage.error(error.message || '鍔犺浇鐢ㄦ埛鍒楄〃澶辫触')
    }
  } finally {
    loading.value = false
  }
}

// 鍔犺浇鐢ㄦ埛缁熻淇℃伅
const loadUserStats = async () => {
  statsLoading.value = true
  try {
    const response = await getUserStats()
    userStats.value = response
  } catch (error) {
    console.warn('鍔犺浇鐢ㄦ埛缁熻澶辫触锛堝姛鑳戒笉褰卞搷锛?', error.message || error)
    // 缁熻淇℃伅鍔犺浇澶辫触涓嶅奖鍝嶄富鍔熻兘锛屼繚鎸侀粯璁ゅ€?  } finally {
    statsLoading.value = false
  }
}

// 鏂规硶
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
  ElMessage.success('鐢ㄦ埛鍒楄〃宸插埛鏂?)
}

const exportUsers = () => {
  ElMessage.info('瀵煎嚭鍔熻兘寮€鍙戜腑...')
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
    `纭畾瑕佺鐢ㄧ敤鎴?"${user.username}" 鍚楋紵绂佺敤鍚庤鐢ㄦ埛灏嗘棤娉曠櫥褰曠郴缁熴€俙,
    '纭绂佺敤',
    { type: 'warning' }
  ).then(async () => {
    try {
      await updateUser(user.id, { status: 'banned' })
      await loadUsers()
      await loadUserStats()
      ElMessage.success('鐢ㄦ埛宸茬鐢?)
    } catch (error: any) {
      ElMessage.error(error.message || '绂佺敤澶辫触')
    }
  })
}

const enableUser = (user: User) => {
  ElMessageBox.confirm(
    `纭畾瑕佸惎鐢ㄧ敤鎴?"${user.username}" 鍚楋紵`,
    '纭鍚敤',
    { type: 'info' }
  ).then(async () => {
    try {
      await updateUser(user.id, { status: 'active' })
      await loadUsers()
      await loadUserStats()
      ElMessage.success('鐢ㄦ埛宸插惎鐢?)
    } catch (error: any) {
      ElMessage.error(error.message || '鍚敤澶辫触')
    }
  })
}

const deleteUser = (user: User) => {
  ElMessageBox.confirm(
    `纭畾瑕佸垹闄ょ敤鎴?"${user.username}" 鍚楋紵鍒犻櫎鍚庢暟鎹皢鏃犳硶鎭㈠銆俙,
    '纭鍒犻櫎',
    { type: 'error', confirmButtonText: '鍒犻櫎' }
  ).then(async () => {
    try {
      await deleteUserApi(user.id)
      await loadUsers()
      await loadUserStats()
      ElMessage.success('鐢ㄦ埛宸插垹闄?)
    } catch (error: any) {
      ElMessage.error(error.message || '鍒犻櫎澶辫触')
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
          // 鏇存柊鐢ㄦ埛
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
          ElMessage.success('鐢ㄦ埛鏇存柊鎴愬姛')
        } else {
          // 鍒涘缓鐢ㄦ埛
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
          ElMessage.success('鐢ㄦ埛鍒涘缓鎴愬姛')
        }
        
        // 閲嶆柊鍔犺浇鏁版嵁
        await loadUsers()
        await loadUserStats()
        showUserDialog.value = false
        userFormRef.value?.resetFields()
      } catch (error: any) {
        ElMessage.error(error.message || '鎿嶄綔澶辫触')
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
    super_admin: '瓒呯骇绠＄悊鍛?,
    admin: '绠＄悊鍛?,
    user: '鏅€氱敤鎴?
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
    active: '娲昏穬',
    inactive: '鏈縺娲?,
    banned: '绂佺敤'
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
  // 寤惰繜妫€鏌ユ潈闄愶紝绛夊緟store鍒濆鍖?  setTimeout(() => {
    // 棣栧厛灏濊瘯浠巐ocalStorage璇诲彇鐢ㄦ埛鏁版嵁
    let userRole = currentUser.value?.role
    if (!userRole) {
      try {
        const userInStorage = localStorage.getItem('user')
        if (userInStorage) {
          const userData = JSON.parse(userInStorage)
          userRole = userData.role
          console.log('UserList: 浠巐ocalStorage璇诲彇鐢ㄦ埛瑙掕壊:', userRole)
        }
      } catch (err) {
        console.error('UserList: 浠巐ocalStorage璇诲彇鐢ㄦ埛鏁版嵁澶辫触:', err)
      }
    }
    
    // 濡傛灉浠嶇劧娌℃湁瑙掕壊淇℃伅锛岄噸瀹氬悜鍒扮櫥褰曢〉
    if (!userRole) {
      console.log('UserList: 鐢ㄦ埛鏈櫥褰曪紝璺宠浆鍒扮櫥褰曢〉')
      router.push('/login')
      return
    }
    
    // 妫€鏌ョ鐞嗗憳鏉冮檺
    const isAdmin = userRole === 'admin' || userRole === 'super_admin'
    if (!isAdmin) {
      ElMessage.error('鏉冮檺涓嶈冻锛岄渶瑕佺鐞嗗憳鏉冮檺')
      router.push('/dashboard')
      return
    }
    
    // 鍔犺浇鐢ㄦ埛鏁版嵁鍜岀粺璁′俊鎭?    loadUsers()
    loadUserStats()
  }, 500) // 寤惰繜500ms绛夊緟store鍒濆鍖?})
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

/* 琛ㄦ牸琛屾牱寮?*/
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