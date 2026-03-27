<template>
  <div class="project-list-container">
    <div class="project-header">
      <h2 class="project-title">椤圭洰绠＄悊</h2>
      <p class="project-subtitle">鍒涘缓鍜岀鐞嗛」鐩紝璺熻釜杩涘害</p>

      <div class="project-actions">
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          鍒涘缓椤圭洰
        </el-button>
      </div>
    </div>

    <!-- 杩囨护鍜屾悳绱?-->
    <div class="project-filters">
      <el-input
        v-model="searchText"
        placeholder="鎼滅储椤圭洰鍚嶇О鎴栨弿杩?
        clearable
        class="search-input"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterStatus" placeholder="鐘舵€? clearable @change="handleFilter">
        <el-option label="瑙勫垝涓? value="planning" />
        <el-option label="杩涜涓? value="active" />
        <el-option label="宸叉殏鍋? value="paused" />
        <el-option label="宸插畬鎴? value="completed" />
        <el-option label="宸插綊妗? value="archived" />
      </el-select>

      <el-select v-model="filterPriority" placeholder="浼樺厛绾? clearable @change="handleFilter">
        <el-option label="浣? value="low" />
        <el-option label="涓? value="medium" />
        <el-option label="楂? value="high" />
        <el-option label="绱ф€? value="urgent" />
      </el-select>
    </div>

    <!-- 椤圭洰鍒楄〃 -->
    <div class="project-grid">
      <el-card
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card"
        shadow="hover"
        @click="viewProject(project.id)"
      >
        <template #header>
          <div class="project-card-header">
            <div class="project-title-wrapper">
              <h3 class="project-name">{{ project.name }}</h3>
              <el-tag :type="getStatusTagType(project.status)" size="small">
                {{ getStatusText(project.status) }}
              </el-tag>
              <el-tag :type="getPriorityTagType(project.priority)" size="small">
                {{ getPriorityText(project.priority) }}
              </el-tag>
            </div>
            <el-dropdown @command="handleProjectCommand($event, project.id)">
              <el-icon class="project-menu"><More /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">缂栬緫椤圭洰</el-dropdown-item>
                  <el-dropdown-item command="members">绠＄悊鎴愬憳</el-dropdown-item>
                  <el-dropdown-item command="tasks">鏌ョ湅浠诲姟</el-dropdown-item>
                  <el-dropdown-item divided command="archive">褰掓。椤圭洰</el-dropdown-item>
                  <el-dropdown-item command="delete">鍒犻櫎椤圭洰</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>

        <div class="project-description">
          {{ project.description || '鏆傛棤鎻忚堪' }}
        </div>

        <div class="project-progress">
          <div class="progress-info">
            <span>杩涘害</span>
            <span class="progress-percent">{{ project.progress }}%</span>
          </div>
          <el-progress :percentage="project.progress" :show-text="false" />
        </div>

        <div class="project-stats">
          <div class="stat-item">
            <el-icon><User /></el-icon>
            <span>{{ project.members_count || 0 }} 鎴愬憳</span>
          </div>
          <div class="stat-item">
            <el-icon><List /></el-icon>
            <span>{{ project.tasks_count || 0 }} 浠诲姟</span>
          </div>
          <div class="stat-item">
            <el-icon><Check /></el-icon>
            <span>{{ project.completed_tasks_count || 0 }} 瀹屾垚</span>
          </div>
        </div>

        <div class="project-footer">
          <div class="project-owner">
            <el-avatar :size="24" :src="project.owner?.avatar_url">
              {{
                project.owner?.fullname?.substring(0, 1) ||
                project.owner?.username?.substring(0, 1) ||
                'U'
              }}
            </el-avatar>
            <span class="owner-name">{{
              project.owner?.fullname || project.owner?.username || '鏈煡鐢ㄦ埛'
            }}</span>
          </div>
          <div class="project-date">
            <el-icon><Calendar /></el-icon>
            <span v-if="project.deadline">鎴: {{ formatDate(project.deadline) }}</span>
            <span v-else>鏃犳埅姝㈡棩鏈?/span>
          </div>
        </div>
      </el-card>

      <!-- 绌虹姸鎬?-->
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <el-empty description="鏆傛棤椤圭洰">
          <el-button type="primary" @click="showCreateDialog = true"> 鍒涘缓绗竴涓」鐩?</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 鍒涘缓椤圭洰瀵硅瘽妗?-->
    <el-dialog
      v-model="showCreateDialog"
      title="鍒涘缓椤圭洰"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="椤圭洰鍚嶇О" prop="name">
          <el-input
            v-model="createForm.name"
            placeholder="璇疯緭鍏ラ」鐩悕绉?
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="椤圭洰鎻忚堪" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="璇疯緭鍏ラ」鐩弿杩?
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="鎵€灞炲洟闃? prop="team_id">
          <el-select v-model="createForm.team_id" placeholder="璇烽€夋嫨鍥㈤槦" style="width: 100%">
            <el-option
              v-for="team in availableTeams"
              :key="team.id"
              :label="team.name"
              :value="team.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="椤圭洰鐘舵€? prop="status">
          <el-select v-model="createForm.status" placeholder="璇烽€夋嫨鐘舵€? style="width: 100%">
            <el-option label="瑙勫垝涓? value="planning" />
            <el-option label="杩涜涓? value="active" />
            <el-option label="宸叉殏鍋? value="paused" />
          </el-select>
        </el-form-item>

        <el-form-item label="浼樺厛绾? prop="priority">
          <el-select v-model="createForm.priority" placeholder="璇烽€夋嫨浼樺厛绾? style="width: 100%">
            <el-option label="浣? value="low" />
            <el-option label="涓? value="medium" />
            <el-option label="楂? value="high" />
            <el-option label="绱ф€? value="urgent" />
          </el-select>
        </el-form-item>

        <el-form-item label="鎴鏃ユ湡" prop="deadline">
          <el-date-picker
            v-model="createForm.deadline"
            type="date"
            placeholder="閫夋嫨鎴鏃ユ湡"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">鍙栨秷</el-button>
          <el-button type="primary" @click="handleCreateSubmit" :loading="creating">
            鍒涘缓
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Search, More, User, List, Check, Calendar } from '@element-plus/icons-vue'
import type { Project } from '@/types/project'
import type { Team } from '@/types/team'

const router = useRouter()

// 鍝嶅簲寮忔暟鎹?const projects = ref<Project[]>([
  {
    id: 1,
    name: '缃戠珯閲嶆瀯椤圭洰',
    description: '瀵圭幇鏈夌綉绔欒繘琛岀幇浠ｅ寲閲嶆瀯锛屾彁鍗囩敤鎴蜂綋楠?,
    team_id: 1,
    owner_id: 1,
    status: 'active',
    priority: 'high',
    progress: 65,
    start_date: '2026-03-01',
    deadline: '2026-04-30',
    budget: 50000,
    actual_cost: 32000,
    tags: ['鍓嶇', '鍚庣', '璁捐'],
    members_count: 8,
    tasks_count: 45,
    completed_tasks_count: 29,
    created_at: '2026-03-01T10:00:00Z',
    owner: {
      id: 1,
      username: 'admin',
      fullname: '绠＄悊鍛?,
      avatar_url: 'https://via.placeholder.com/50',
    },
    team: {
      id: 1,
      name: '鐮斿彂閮?,
    },
  },
  {
    id: 2,
    name: '绉诲姩搴旂敤寮€鍙?,
    description: '寮€鍙戝叏鏂扮殑璺ㄥ钩鍙扮Щ鍔ㄥ簲鐢?,
    team_id: 2,
    owner_id: 2,
    status: 'planning',
    priority: 'urgent',
    progress: 20,
    start_date: '2026-03-15',
    deadline: '2026-06-30',
    budget: 80000,
    actual_cost: 15000,
    tags: ['绉诲姩绔?, 'React Native', 'UI璁捐'],
    members_count: 5,
    tasks_count: 32,
    completed_tasks_count: 6,
    created_at: '2026-03-15T14:30:00Z',
    owner: {
      id: 2,
      username: 'johndoe',
      fullname: 'John Doe',
      avatar_url: 'https://via.placeholder.com/50',
    },
    team: {
      id: 2,
      name: '绉诲姩寮€鍙戠粍',
    },
  },
  {
    id: 3,
    name: '鏁版嵁杩佺Щ椤圭洰',
    description: '灏嗘棫绯荤粺鏁版嵁杩佺Щ鍒版柊骞冲彴',
    team_id: 1,
    owner_id: 3,
    status: 'completed',
    priority: 'medium',
    progress: 100,
    start_date: '2026-02-01',
    deadline: '2026-03-15',
    budget: 30000,
    actual_cost: 28000,
    tags: ['鏁版嵁搴?, '杩佺Щ', 'ETL'],
    members_count: 4,
    tasks_count: 28,
    completed_tasks_count: 28,
    created_at: '2026-02-01T09:15:00Z',
    owner: {
      id: 3,
      username: 'janedoe',
      fullname: 'Jane Doe',
      avatar_url: 'https://via.placeholder.com/50',
    },
    team: {
      id: 1,
      name: '鐮斿彂閮?,
    },
  },
])

const availableTeams = ref<Team[]>([
  {
    id: 1,
    name: '鐮斿彂閮?,
    description: '鎶€鏈爺鍙戝洟闃?,
    owner_id: 1,
    privacy: 'private',
    created_at: '2026-01-01',
  },
  {
    id: 2,
    name: '绉诲姩寮€鍙戠粍',
    description: '绉诲姩搴旂敤寮€鍙?,
    owner_id: 2,
    privacy: 'private',
    created_at: '2026-01-15',
  },
  {
    id: 3,
    name: '璁捐閮?,
    description: 'UI/UX璁捐',
    owner_id: 3,
    privacy: 'public',
    created_at: '2026-02-01',
  },
])

const searchText = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const showCreateDialog = ref(false)
const creating = ref(false)

const createForm = ref({
  name: '',
  description: '',
  team_id: undefined as number | undefined,
  status: 'planning',
  priority: 'medium',
  deadline: '',
})

const createFormRef = ref<FormInstance>()
const createRules: FormRules = {
  name: [
    { required: true, message: '璇疯緭鍏ラ」鐩悕绉?, trigger: 'blur' },
    { min: 2, max: 50, message: '闀垮害鍦?2 鍒?50 涓瓧绗?, trigger: 'blur' },
  ],
  description: [{ max: 200, message: '涓嶈兘瓒呰繃 200 涓瓧绗?, trigger: 'blur' }],
  team_id: [{ required: true, message: '璇烽€夋嫨鎵€灞炲洟闃?, trigger: 'change' }],
}

// 璁＄畻灞炴€?const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    const matchesSearch =
      !searchText.value ||
      project.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      project.description.toLowerCase().includes(searchText.value.toLowerCase())

    const matchesStatus = !filterStatus.value || project.status === filterStatus.value
    const matchesPriority = !filterPriority.value || project.priority === filterPriority.value

    return matchesSearch && matchesStatus && matchesPriority
  })
})

// 鏂规硶
const handleSearch = () => {
  // 鎼滅储閫昏緫宸查€氳繃璁＄畻灞炴€у疄鐜?}

const handleFilter = () => {
  // 杩囨护閫昏緫宸查€氳繃璁＄畻灞炴€у疄鐜?}

const viewProject = (projectId: number) => {
  router.push(`/projects/${projectId}`)
}

const handleProjectCommand = (command: string, projectId: number) => {
  const project = projects.value.find((p) => p.id === projectId)
  if (!project) return

  switch (command) {
    case 'edit':
      editProject(project)
      break
    case 'members':
      manageMembers(projectId)
      break
    case 'tasks':
      viewTasks(projectId)
      break
    case 'archive':
      archiveProject(projectId)
      break
    case 'delete':
      deleteProject(projectId)
      break
  }
}

const editProject = (project: Project) => {
  ElMessage.info(`缂栬緫椤圭洰: ${project.name}`)
  // TODO: 瀹炵幇缂栬緫鍔熻兘
}

const manageMembers = (projectId: number) => {
  ElMessage.info(`绠＄悊椤圭洰鎴愬憳: ${projectId}`)
  // TODO: 瀹炵幇鎴愬憳绠＄悊
}

const viewTasks = (projectId: number) => {
  router.push(`/tasks?project_id=${projectId}`)
}

const archiveProject = (projectId: number) => {
  ElMessageBox.confirm('纭畾瑕佸綊妗ｈ椤圭洰鍚楋紵褰掓。鍚庨」鐩皢鍙樹负鍙鐘舵€併€?, '纭褰掓。', {
    type: 'warning',
  }).then(() => {
    const project = projects.value.find((p) => p.id === projectId)
    if (project) {
      project.status = 'archived'
      ElMessage.success('椤圭洰宸插綊妗?)
    }
  })
}

const deleteProject = (projectId: number) => {
  ElMessageBox.confirm('纭畾瑕佸垹闄よ椤圭洰鍚楋紵鍒犻櫎鍚庢暟鎹皢鏃犳硶鎭㈠銆?, '纭鍒犻櫎', {
    type: 'error',
    confirmButtonText: '鍒犻櫎',
  }).then(() => {
    projects.value = projects.value.filter((p) => p.id !== projectId)
    ElMessage.success('椤圭洰宸插垹闄?)
  })
}

const handleDialogClose = () => {
  showCreateDialog.value = false
  createFormRef.value?.resetFields()
}

const handleCreateSubmit = () => {
  if (!createFormRef.value) return

  createFormRef.value.validate((valid) => {
    if (valid) {
      creating.value = true

      // 妯℃嫙API璋冪敤寤惰繜
      setTimeout(() => {
        const newProject: Project = {
          id: projects.value.length + 1,
          name: createForm.value.name,
          description: createForm.value.description,
          team_id: createForm.value.team_id,
          owner_id: 1, // 褰撳墠鐢ㄦ埛ID
          status: createForm.value.status as any,
          priority: createForm.value.priority as any,
          progress: 0,
          deadline: createForm.value.deadline,
          tags: [],
          created_at: new Date().toISOString(),
          owner: {
            id: 1,
            username: 'currentuser',
            fullname: '褰撳墠鐢ㄦ埛',
          },
          team: availableTeams.value.find((t) => t.id === createForm.value.team_id),
        }

        projects.value.unshift(newProject)
        creating.value = false
        showCreateDialog.value = false
        createFormRef.value?.resetFields()
        ElMessage.success('椤圭洰鍒涘缓鎴愬姛')
      }, 1000)
    }
  })
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 // 绂佺敤浠婂ぉ涔嬪墠鐨勬棩鏈?}

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    planning: 'info',
    active: 'success',
    paused: 'warning',
    completed: '',
    archived: 'info',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    planning: '瑙勫垝涓?,
    active: '杩涜涓?,
    paused: '宸叉殏鍋?,
    completed: '宸插畬鎴?,
    archived: '宸插綊妗?,
  }
  return map[status] || status
}

const getPriorityTagType = (priority: string) => {
  const map: Record<string, string> = {
    low: 'info',
    medium: '',
    high: 'warning',
    urgent: 'danger',
  }
  return map[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const map: Record<string, string> = {
    low: '浣?,
    medium: '涓?,
    high: '楂?,
    urgent: '绱ф€?,
  }
  return map[priority] || priority
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  // 鍙互鍦ㄨ繖閲屽姞杞介」鐩暟鎹?})
</script>

<style scoped>
.project-list-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.project-header {
  margin-bottom: 24px;
}

.project-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.project-subtitle {
  color: var(--el-text-color-secondary);
  margin: 0 0 16px 0;
}

.project-actions {
  display: flex;
  justify-content: flex-end;
}

.project-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.project-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-4px);
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.project-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.project-menu {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  padding: 4px;
  border-radius: 4px;
}

.project-menu:hover {
  background-color: var(--el-fill-color-light);
}

.project-description {
  color: var(--el-text-color-secondary);
  margin: 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-progress {
  margin: 16px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-percent {
  font-weight: 600;
  color: var(--el-color-primary);
}

.project-stats {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  padding: 12px 0;
  border-top: 1px solid var(--el-border-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.project-owner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-name {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.project-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.empty-state {
  grid-column: 1 / -1;
  padding: 60px 20px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
