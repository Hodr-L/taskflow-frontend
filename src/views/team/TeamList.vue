<template>
  <div class="team-list-container">
    <div class="team-header">
      <h2 class="team-title">鍥㈤槦绠＄悊</h2>
      <p class="team-subtitle">鍒涘缓鍜岀鐞嗘偍鐨勫崗浣滃洟闃?/p>

      <div class="team-actions">
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          鍒涘缓鍥㈤槦
        </el-button>
      </div>
    </div>

    <!-- 鍥㈤槦鍒楄〃 -->
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
                <el-dropdown-item command="edit">缂栬緫鍥㈤槦</el-dropdown-item>
                <el-dropdown-item command="members">绠＄悊鎴愬憳</el-dropdown-item>
                <el-dropdown-item command="settings">鍥㈤槦璁剧疆</el-dropdown-item>
                <el-dropdown-item divided command="delete">鍒犻櫎鍥㈤槦</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="team-stats">
          <div class="stat-item">
            <el-icon><User /></el-icon>
            <span>{{ team.member_count }} 鎴愬憳</span>
          </div>
          <div class="stat-item">
            <el-icon><Folder /></el-icon>
            <span>{{ team.project_count }} 椤圭洰</span>
          </div>
          <div class="stat-item">
            <el-icon><List /></el-icon>
            <span>{{ team.task_count }} 浠诲姟</span>
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

      <!-- 绌虹姸鎬?-->
      <div v-if="teams.length === 0" class="empty-state">
        <el-empty description="鏆傛棤鍥㈤槦">
          <el-button type="primary" @click="showCreateDialog = true"> 鍒涘缓绗竴涓洟闃?</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 鍒涘缓鍥㈤槦瀵硅瘽妗?-->
    <el-dialog
      v-model="showCreateDialog"
      title="鍒涘缓鍥㈤槦"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="鍥㈤槦鍚嶇О" prop="name">
          <el-input
            v-model="createForm.name"
            placeholder="璇疯緭鍏ュ洟闃熷悕绉?
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="鍥㈤槦鎻忚堪" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="璇疯緭鍏ュ洟闃熸弿杩?
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="鍥㈤槦绫诲瀷" prop="type">
          <el-select v-model="createForm.type" placeholder="璇烽€夋嫨鍥㈤槦绫诲瀷">
            <el-option label="椤圭洰鍥㈤槦" value="project" />
            <el-option label="閮ㄩ棬鍥㈤槦" value="department" />
            <el-option label="鍏磋叮灏忕粍" value="interest" />
            <el-option label="鍏朵粬" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="闅愮璁剧疆" prop="privacy">
          <el-radio-group v-model="createForm.privacy">
            <el-radio label="public">鍏紑锛堟墍鏈変汉鍙锛?/el-radio>
            <el-radio label="private">绉佹湁锛堜粎鎴愬憳鍙锛?/el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">鍙栨秷</el-button>
          <el-button type="primary" :loading="creating" @click="handleCreateTeam">
            鍒涘缓鍥㈤槦
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

// 鍥㈤槦鏁版嵁
const teams = ref([
  {
    id: 1,
    name: '鍓嶇寮€鍙戝洟闃?,
    description: '璐熻矗鍓嶇鐣岄潰寮€鍙戝拰鐢ㄦ埛浣撻獙浼樺寲',
    avatar_url: '',
    member_count: 8,
    project_count: 3,
    task_count: 24,
    owner_name: '寮犱笁',
    owner_avatar: '',
    user_role: 'owner',
    type: 'project',
    privacy: 'private',
    created_at: '2026-01-15',
  },
  {
    id: 2,
    name: '鍚庣鏋舵瀯缁?,
    description: '绯荤粺鏋舵瀯璁捐鍜屽悗绔湇鍔″紑鍙?,
    avatar_url: '',
    member_count: 6,
    project_count: 2,
    task_count: 18,
    owner_name: '鏉庡洓',
    owner_avatar: '',
    user_role: 'admin',
    type: 'department',
    privacy: 'public',
    created_at: '2026-02-10',
  },
  {
    id: 3,
    name: '浜у搧璁捐灏忕粍',
    description: '浜у搧鍘熷瀷璁捐鍜岀敤鎴蜂綋楠岀爺绌?,
    avatar_url: '',
    member_count: 4,
    project_count: 1,
    task_count: 12,
    owner_name: '鐜嬩簲',
    owner_avatar: '',
    user_role: 'member',
    type: 'interest',
    privacy: 'private',
    created_at: '2026-03-01',
  },
])

// 鍒涘缓鍥㈤槦琛ㄥ崟
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
    { required: true, message: '璇疯緭鍏ュ洟闃熷悕绉?, trigger: 'blur' },
    { min: 2, max: 50, message: '鍥㈤槦鍚嶇О闀垮害鍦?鍒?0涓瓧绗︿箣闂?, trigger: 'blur' },
  ],
  description: [
    { required: true, message: '璇疯緭鍏ュ洟闃熸弿杩?, trigger: 'blur' },
    { max: 200, message: '鍥㈤槦鎻忚堪涓嶈兘瓒呰繃200涓瓧绗?, trigger: 'blur' },
  ],
  type: [{ required: true, message: '璇烽€夋嫨鍥㈤槦绫诲瀷', trigger: 'change' }],
}

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

// 鏌ョ湅鍥㈤槦璇︽儏
const viewTeam = (teamId: number) => {
  router.push(`/teams/${teamId}`)
}

// 澶勭悊鍥㈤槦鍛戒护
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

// 缂栬緫鍥㈤槦
const editTeam = (teamId: number) => {
  ElMessage.info(`缂栬緫鍥㈤槦 ${teamId}`)
}

// 绠＄悊鎴愬憳
const manageMembers = (teamId: number) => {
  ElMessage.info(`绠＄悊鍥㈤槦 ${teamId} 鐨勬垚鍛榒)
}

// 鍥㈤槦璁剧疆
const teamSettings = (teamId: number) => {
  ElMessage.info(`鍥㈤槦 ${teamId} 璁剧疆`)
}

// 鍒犻櫎鍥㈤槦
const deleteTeam = async (teamId: number) => {
  try {
    await ElMessageBox.confirm('纭畾瑕佸垹闄よ繖涓洟闃熷悧锛熸鎿嶄綔涓嶅彲鎭㈠銆?, '璀﹀憡', {
      confirmButtonText: '纭畾鍒犻櫎',
      cancelButtonText: '鍙栨秷',
      type: 'warning',
    })

    // TODO: 璋冪敤鍒犻櫎鍥㈤槦鐨凙PI
    teams.value = teams.value.filter((team) => team.id !== teamId)
    ElMessage.success('鍥㈤槦鍒犻櫎鎴愬姛')
  } catch {
    // 鐢ㄦ埛鍙栨秷
  }
}

// 鍒涘缓鍥㈤槦
const handleCreateTeam = async () => {
  creating.value = true

  try {
    // TODO: 璋冪敤鍒涘缓鍥㈤槦鐨凙PI
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newTeam = {
      id: teams.value.length + 1,
      name: createForm.name,
      description: createForm.description,
      avatar_url: '',
      member_count: 1,
      project_count: 0,
      task_count: 0,
      owner_name: '褰撳墠鐢ㄦ埛',
      owner_avatar: '',
      user_role: 'owner',
      type: createForm.type,
      privacy: createForm.privacy,
      created_at: new Date().toISOString().split('T')[0],
    }

    teams.value.unshift(newTeam)
    ElMessage.success('鍥㈤槦鍒涘缓鎴愬姛')
    showCreateDialog.value = false
    resetCreateForm()
  } catch (error) {
    ElMessage.error('鍒涘缓澶辫触锛岃閲嶈瘯')
  } finally {
    creating.value = false
  }
}

// 閲嶇疆鍒涘缓琛ㄥ崟
const resetCreateForm = () => {
  createForm.name = ''
  createForm.description = ''
  createForm.type = 'project'
  createForm.privacy = 'private'
}

// 瀵硅瘽妗嗗叧闂鐞?const handleDialogClose = (done: () => void) => {
  if (creating.value) {
    ElMessage.warning('姝ｅ湪鍒涘缓涓紝璇风◢鍊?)
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

/* 鍥㈤槦缃戞牸 */
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

/* 鍥㈤槦缁熻 */
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

/* 鍥㈤槦椤佃剼 */
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

/* 绌虹姸鎬?*/
.empty-state {
  grid-column: 1 / -1;
  padding: 60px 0;
}

/* 鍝嶅簲寮忚璁?*/
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
