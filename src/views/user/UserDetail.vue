<template>
  <div class="user-detail-container">
    <!-- 鐢ㄦ埛澶撮儴淇℃伅 -->
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
              {{ user.email_verified ? '閭宸查獙璇? : '閭鏈獙璇? }}
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
          <el-button type="primary" :icon="Edit" @click="handleEdit">缂栬緫</el-button>
          <el-dropdown @command="handleMoreCommand">
            <el-button :icon="More">鏇村</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="user.status === 'active'" :icon="Lock" command="disable">绂佺敤璐︽埛</el-dropdown-item>
                <el-dropdown-item v-else :icon="Unlock" command="enable">鍚敤璐︽埛</el-dropdown-item>
                <el-dropdown-item :icon="Key" command="resetPassword">閲嶇疆瀵嗙爜</el-dropdown-item>
                <el-dropdown-item :icon="Message" command="sendVerification">鍙戦€侀獙璇侀偖浠?/el-dropdown-item>
                <el-dropdown-item divided :icon="Delete" command="delete">鍒犻櫎璐︽埛</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 閫夐」鍗?-->
    <div class="user-tabs">
      <el-tabs v-model="activeTab" class="user-detail-tabs">
        <el-tab-pane label="鍩烘湰淇℃伅" name="info">
          <div class="tab-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="鐢ㄦ埛ID">{{ user.id }}</el-descriptions-item>
              <el-descriptions-item label="鐢ㄦ埛鍚?>{{ user.username }}</el-descriptions-item>
              <el-descriptions-item label="閭">{{ user.email }}</el-descriptions-item>
              <el-descriptions-item label="濮撳悕">{{ user.fullname || '鏈缃? }}</el-descriptions-item>
              <el-descriptions-item label="鑱屼綅/绠€浠?>{{ user.bio || '鏈缃? }}</el-descriptions-item>
              <el-descriptions-item label="瑙掕壊">{{ getRoleText(user.role) }}</el-descriptions-item>
              <el-descriptions-item label="鐘舵€?>{{ getStatusText(user.status || 'active') }}</el-descriptions-item>
              <el-descriptions-item label="閭楠岃瘉">{{ user.email_verified ? '宸查獙璇? : '鏈獙璇? }}</el-descriptions-item>
              <el-descriptions-item label="鏈€鍚庣櫥褰?>{{ formatDate(user.last_login_at) || '浠庢湭鐧诲綍' }}</el-descriptions-item>
              <el-descriptions-item label="鍒涘缓鏃堕棿">{{ formatDate(user.created_at) }}</el-descriptions-item>
              <el-descriptions-item label="鏇存柊鏃堕棿">{{ formatDate(user.updated_at) }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="鎵€灞炲洟闃? name="teams">
          <div class="tab-content">
            <h3>鍥㈤槦鍒楄〃</h3>
            <p v-if="userTeams.length === 0">璇ョ敤鎴峰皻鏈姞鍏ヤ换浣曞洟闃?/p>
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
                <p>{{ team.description || '鏆傛棤鎻忚堪' }}</p>
                <div class="team-card-footer">
                  <span>鍔犲叆鏃堕棿: {{ formatDate(team.joined_at) }}</span>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="椤圭洰缁熻" name="projects">
          <div class="tab-content">
            <h3>椤圭洰鍙備笌鎯呭喌</h3>
            <div class="project-stats">
              <el-card class="stat-card">
                <div class="stat-content">
                  <span class="stat-number">{{ projectStats.total || 0 }}</span>
                  <span class="stat-label">鍙備笌椤圭洰鏁?/span>
                </div>
              </el-card>
              <el-card class="stat-card">
                <div class="stat-content">
                  <span class="stat-number" style="color: #67c23a;">{{ projectStats.completed || 0 }}</span>
                  <span class="stat-label">宸插畬鎴愰」鐩?/span>
                </div>
              </el-card>
              <el-card class="stat-card">
                <div class="stat-content">
                  <span class="stat-number" style="color: #e6a23c;">{{ projectStats.active || 0 }}</span>
                  <span class="stat-label">杩涜涓」鐩?/span>
                </div>
              </el-card>
              <el-card class="stat-card">
                <div class="stat-content">
                  <span class="stat-number" style="color: #1989fa;">{{ projectStats.tasks || 0 }}</span>
                  <span class="stat-label">鎬讳换鍔℃暟</span>
                </div>
              </el-card>
            </div>
            
            <el-table
              :data="userProjects"
              style="width: 100%"
              class="project-table"
            >
              <el-table-column label="椤圭洰鍚嶇О" min-width="200">
                <template #default="{ row }">
                  <div class="project-cell">
                    <div class="project-name">{{ row.name }}</div>
                    <div class="project-team">{{ row.team_name }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="瑙掕壊" width="120">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.role }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="鐘舵€? width="120">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                    {{ row.status === 'active' ? '杩涜涓? : row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="浠诲姟鏁? width="100">
                <template #default="{ row }">
                  {{ row.task_count || 0 }}
                </template>
              </el-table-column>
              <el-table-column label="鍔犲叆鏃堕棿" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.joined_at) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="娲诲姩鏃ュ織" name="activities">
          <div class="tab-content">
            <h3>鐢ㄦ埛娲诲姩璁板綍</h3>
            <p>娲诲姩鏃ュ織鍔熻兘寮€鍙戜腑...</p>
            <!-- 杩欓噷鍙互娣诲姞娲诲姩鏃ュ織鍒楄〃 -->
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 缂栬緫鐢ㄦ埛瀵硅瘽妗?-->
    <el-dialog
      v-model="showEditDialog"
      title="缂栬緫鐢ㄦ埛"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="80px"
      >
        <el-form-item label="鐢ㄦ埛鍚? prop="username">
          <el-input
            v-model="editForm.username"
            placeholder="璇疯緭鍏ョ敤鎴峰悕"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="閭" prop="email">
          <el-input
            v-model="editForm.email"
            type="email"
            placeholder="璇疯緭鍏ラ偖绠?
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item label="濮撳悕" prop="fullname">
          <el-input
            v-model="editForm.fullname"
            placeholder="璇疯緭鍏ュ鍚?
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item label="鑱屼綅/绠€浠? prop="bio">
          <el-input
            v-model="editForm.bio"
            placeholder="璇疯緭鍏ヨ亴浣嶆垨绠€浠?
            maxlength="255"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="瑙掕壊" prop="role">
              <el-select v-model="editForm.role" placeholder="璇烽€夋嫨瑙掕壊" style="width: 100%">
                <el-option label="鏅€氱敤鎴? value="user" />
                <el-option label="绠＄悊鍛? value="admin" />
                <el-option label="瓒呯骇绠＄悊鍛? value="super_admin" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="鐘舵€? prop="status">
              <el-select v-model="editForm.status" placeholder="璇烽€夋嫨鐘舵€? style="width: 100%">
                <el-option label="娲昏穬" value="active" />
                <el-option label="鏈縺娲? value="inactive" />
                <el-option label="绂佺敤" value="banned" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="澶村儚URL" prop="avatar_url">
          <el-input
            v-model="editForm.avatar_url"
            placeholder="璇疯緭鍏ュご鍍廢RL"
            maxlength="255"
          />
        </el-form-item>
        
        <el-form-item label="閭楠岃瘉" prop="email_verified">
          <el-switch
            v-model="editForm.email_verified"
            active-text="宸查獙璇?
            inactive-text="鏈獙璇?
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">鍙栨秷</el-button>
          <el-button type="primary" @click="handleEditSubmit" :loading="editing">
            鏇存柊
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

// 鍝嶅簲寮忔暟鎹?const user = ref<UserType>({
  id: Number(route.params.id) || 1,
  username: 'developer',
  email: 'dev@example.com',
  fullname: '寮€鍙戝伐绋嬪笀',
  bio: '鍚庣寮€鍙戝伐绋嬪笀锛屼笓娉ㄤ簬Go鍜屽井鏈嶅姟鏋舵瀯',
  avatar_url: 'https://via.placeholder.com/150',
  role: 'user',
  status: 'active',
  email_verified: true,
  last_login_at: '2026-03-20T09:15:00Z',
  created_at: '2026-02-01T14:30:00Z',
  updated_at: '2026-03-20T09:15:00Z'
})

const loading = ref(false)

// 鍔犺浇鐢ㄦ埛鏁版嵁
const loadUser = async () => {
  loading.value = true
  try {
    const userId = Number(route.params.id)
    if (!userId) {
      ElMessage.error('鐢ㄦ埛ID鏃犳晥')
      return
    }
    
    const response = await getUserById(userId)
    // 娉ㄦ剰锛歛pi.ts鎷︽埅鍣ㄨ繑鍥瀝esponse.data.data锛屾墍浠ュ浜嶨ET /users/{id}锛?    // 鍚庣杩斿洖鐨勬槸{ user: {...} }锛屾嫤鎴櫒鎻愬彇data鍚庡緱鍒皗 user: {...} }
    // 浣嗗疄闄呬笂getUserById鏈熸湜鐩存帴杩斿洖User瀵硅薄
    // 鏍规嵁鏈嶅姟灞傚畾涔夛紝getUserById搴旇杩斿洖User瀵硅薄
    // 鎵€浠ヨ繖閲宺esponse搴旇灏辨槸User瀵硅薄
    user.value = response
  } catch (error: any) {
    console.error('鍔犺浇鐢ㄦ埛鏁版嵁澶辫触:', error)
    if (error.code === 403) {
      ElMessage.error('鏉冮檺涓嶈冻锛屾棤娉曟煡鐪嬬敤鎴疯鎯?)
      router.push('/users')
    } else if (error.code === 404) {
      ElMessage.error('鐢ㄦ埛涓嶅瓨鍦?)
      router.push('/users')
    } else {
      ElMessage.error(error.message || '鍔犺浇鐢ㄦ埛鏁版嵁澶辫触')
    }
  } finally {
    loading.value = false
  }
}

// 缁勪欢鎸傝浇鏃跺姞杞芥暟鎹?onMounted(() => {
  loadUser()
})

const userTeams = ref([
  {
    id: 1,
    name: '寮€鍙戝洟闃?,
    description: '璐熻矗浜у搧寮€鍙戝拰鎶€鏈敮鎸?,
    role: 'developer',
    joined_at: '2026-02-05T10:00:00Z'
  },
  {
    id: 2,
    name: '娴嬭瘯鍥㈤槦',
    description: '璐熻矗璐ㄩ噺淇濊瘉鍜屾祴璇?,
    role: 'tester',
    joined_at: '2026-02-10T14:30:00Z'
  }
])

const userProjects = ref([
  {
    id: 1,
    name: 'TaskFlow 寮€鍙?,
    team_name: '寮€鍙戝洟闃?,
    role: 'developer',
    status: 'active',
    task_count: 15,
    joined_at: '2026-02-15T09:00:00Z'
  },
  {
    id: 2,
    name: '绉诲姩搴旂敤寮€鍙?,
    team_name: '寮€鍙戝洟闃?,
    role: 'developer',
    status: 'active',
    task_count: 8,
    joined_at: '2026-02-20T14:00:00Z'
  },
  {
    id: 3,
    name: '鏁版嵁搴撹縼绉?,
    team_name: '娴嬭瘯鍥㈤槦',
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
    { required: true, message: '璇疯緭鍏ョ敤鎴峰悕', trigger: 'blur' },
    { min: 3, max: 50, message: '闀垮害鍦?3 鍒?50 涓瓧绗?, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '璇疯緭鍏ラ偖绠?, trigger: 'blur' },
    { type: 'email', message: '璇疯緭鍏ユ纭殑閭鍦板潃', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '璇烽€夋嫨瑙掕壊', trigger: 'change' }
  ],
  status: [
    { required: true, message: '璇烽€夋嫨鐘舵€?, trigger: 'change' }
  ]
}

// 璁＄畻灞炴€?const projectStats = computed(() => {
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

// 鏂规硶
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
    `纭畾瑕佺鐢ㄧ敤鎴?"${user.value.username}" 鍚楋紵绂佺敤鍚庤鐢ㄦ埛灏嗘棤娉曠櫥褰曠郴缁熴€俙,
    '纭绂佺敤',
    { type: 'warning' }
  ).then(async () => {
    try {
      await updateUser(user.value.id, { status: 'banned' })
      user.value.status = 'banned'
      ElMessage.success('鐢ㄦ埛宸茬鐢?)
    } catch (error: any) {
      console.error('绂佺敤鐢ㄦ埛澶辫触:', error)
      ElMessage.error(error.message || '绂佺敤鐢ㄦ埛澶辫触')
    }
  })
}

const enableUser = () => {
  ElMessageBox.confirm(
    `纭畾瑕佸惎鐢ㄧ敤鎴?"${user.value.username}" 鍚楋紵`,
    '纭鍚敤',
    { type: 'info' }
  ).then(async () => {
    try {
      await updateUser(user.value.id, { status: 'active' })
      user.value.status = 'active'
      ElMessage.success('鐢ㄦ埛宸插惎鐢?)
    } catch (error: any) {
      console.error('鍚敤鐢ㄦ埛澶辫触:', error)
      ElMessage.error(error.message || '鍚敤鐢ㄦ埛澶辫触')
    }
  })
}

const resetPassword = () => {
  ElMessageBox.prompt('璇疯緭鍏ユ柊瀵嗙爜', '閲嶇疆瀵嗙爜', {
    confirmButtonText: '纭畾',
    cancelButtonText: '鍙栨秷',
    inputType: 'password',
    inputPattern: /^.{6,100}$/,
    inputErrorMessage: '瀵嗙爜闀垮害闇€鍦?-100涓瓧绗︿箣闂?
  }).then(async ({ value }) => {
    if (!value) return
    
    try {
      await resetUserPassword(user.value.id, { new_password: value })
      ElMessage.success('瀵嗙爜閲嶇疆鎴愬姛')
    } catch (error: any) {
      console.error('閲嶇疆瀵嗙爜澶辫触:', error)
      ElMessage.error(error.message || '閲嶇疆瀵嗙爜澶辫触')
    }
  })
}

const sendVerification = () => {
  ElMessage.info('楠岃瘉閭欢宸插彂閫?)
  // 杩欓噷搴旇璋冪敤API鍙戦€侀獙璇侀偖浠?}

const deleteUser = () => {
  ElMessageBox.confirm(
    `纭畾瑕佸垹闄ょ敤鎴?"${user.value.username}" 鍚楋紵鍒犻櫎鍚庢暟鎹皢鏃犳硶鎭㈠銆俙,
    '纭鍒犻櫎',
    { type: 'error', confirmButtonText: '鍒犻櫎' }
  ).then(() => {
    ElMessage.success('鐢ㄦ埛宸插垹闄?)
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
        
        // 閲嶆柊鍔犺浇鐢ㄦ埛鏁版嵁
        await loadUser()
        
        editing.value = false
        showEditDialog.value = false
        ElMessage.success('鐢ㄦ埛淇℃伅宸叉洿鏂?)
      } catch (error: any) {
        console.error('鏇存柊鐢ㄦ埛淇℃伅澶辫触:', error)
        if (error.code === 403) {
          ElMessage.error('鏉冮檺涓嶈冻锛屾棤娉曟洿鏂扮敤鎴蜂俊鎭?)
        } else if (error.code === 404) {
          ElMessage.error('鐢ㄦ埛涓嶅瓨鍦?)
        } else {
          ElMessage.error(error.message || '鏇存柊鐢ㄦ埛淇℃伅澶辫触')
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
  // 杩欓噷搴旇鏍规嵁璺敱鍙傛暟鍔犺浇鐢ㄦ埛鏁版嵁
  const userId = route.params.id
  console.log('鍔犺浇鐢ㄦ埛鏁版嵁:', userId)
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