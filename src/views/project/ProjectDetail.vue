<template>
  <div class="project-detail-container">
    <!-- 椤圭洰澶撮儴 -->
    <div class="project-header">
      <div class="project-header-main">
        <div class="project-title-section">
          <h1 class="project-title">{{ project.name }}</h1>
          <div class="project-tags">
            <el-tag :type="getStatusTagType(project.status)" size="large">
              {{ getStatusText(project.status) }}
            </el-tag>
            <el-tag :type="getPriorityTagType(project.priority)" size="large">
              {{ getPriorityText(project.priority) }}
            </el-tag>
            <el-tag v-if="project.team" type="info" size="large">
              {{ project.team.name }}
            </el-tag>
          </div>
        </div>

        <div class="project-actions">
          <el-button type="primary" :icon="Edit" @click="handleEdit">缂栬緫椤圭洰</el-button>
          <el-button :icon="Share">鍒嗕韩</el-button>
          <el-dropdown @command="handleMoreCommand">
            <el-button :icon="More">鏇村</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="DocumentCopy" command="duplicate"
                  >澶嶅埗椤圭洰</el-dropdown-item
                >
                <el-dropdown-item :icon="Download" command="export">瀵煎嚭椤圭洰</el-dropdown-item>
                <el-dropdown-item :icon="Archive" command="archive">褰掓。椤圭洰</el-dropdown-item>
                <el-dropdown-item divided :icon="Delete" command="delete"
                  >鍒犻櫎椤圭洰</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="project-description">
        <p>{{ project.description || '鏆傛棤椤圭洰鎻忚堪' }}</p>
      </div>
    </div>

    <!-- 椤圭洰杩涘害鍜岀粺璁?-->
    <div class="project-stats-cards">
      <el-card class="progress-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">椤圭洰杩涘害</span>
          </div>
        </template>
        <div class="progress-content">
          <el-progress
            type="dashboard"
            :percentage="project.progress"
            :color="progressColors"
            :width="120"
          />
          <div class="progress-details">
            <div class="progress-text">
              <span class="progress-label">宸插畬鎴?/span>
              <span class="progress-value"
                >{{ project.completed_tasks_count || 0 }} / {{ project.tasks_count || 0 }}</span
              >
            </div>
            <div class="progress-text">
              <span class="progress-label">鍓╀綑鏃堕棿</span>
              <span class="progress-value">{{ getRemainingDays() }} 澶?/span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">椤圭洰缁熻</span>
          </div>
        </template>
        <div class="stats-content">
          <div class="stat-item">
            <el-icon class="stat-icon"><User /></el-icon>
            <div class="stat-info">
              <span class="stat-label">鎴愬憳</span>
              <span class="stat-value">{{ project.members_count || 0 }} 浜?/span>
            </div>
          </div>
          <div class="stat-item">
            <el-icon class="stat-icon"><List /></el-icon>
            <div class="stat-info">
              <span class="stat-label">浠诲姟鎬绘暟</span>
              <span class="stat-value">{{ project.tasks_count || 0 }}</span>
            </div>
          </div>
          <div class="stat-item">
            <el-icon class="stat-icon"><Check /></el-icon>
            <div class="stat-info">
              <span class="stat-label">宸插畬鎴?/span>
              <span class="stat-value">{{ project.completed_tasks_count || 0 }}</span>
            </div>
          </div>
          <div class="stat-item">
            <el-icon class="stat-icon"><Clock /></el-icon>
            <div class="stat-info">
              <span class="stat-label">杩涜涓?/span>
              <span class="stat-value">{{
                (project.tasks_count || 0) - (project.completed_tasks_count || 0)
              }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">椤圭洰淇℃伅</span>
          </div>
        </template>
        <div class="info-content">
          <div class="info-item">
            <span class="info-label">璐熻矗浜?/span>
            <div class="info-value">
              <el-avatar :size="24" :src="project.owner?.avatar_url" class="owner-avatar">
                {{
                  project.owner?.fullname?.substring(0, 1) ||
                  project.owner?.username?.substring(0, 1) ||
                  'U'
                }}
              </el-avatar>
              <span>{{ project.owner?.fullname || project.owner?.username || '鏈煡鐢ㄦ埛' }}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">寮€濮嬫棩鏈?/span>
            <span class="info-value">{{ formatDate(project.start_date) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">鎴鏃ユ湡</span>
            <span class="info-value" :class="{ 'deadline-warning': isDeadlineNear() }">
              {{ formatDate(project.deadline) || '鏈缃? }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">鍒涘缓鏃堕棿</span>
            <span class="info-value">{{ formatDate(project.created_at) }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 閫夐」鍗?-->
    <div class="project-tabs">
      <el-tabs v-model="activeTab" class="project-detail-tabs">
        <el-tab-pane label="姒傝" name="overview">
          <div class="tab-content">
            <h3>椤圭洰姒傝</h3>
            <p>杩欓噷鏄」鐩殑姒傝淇℃伅锛屾樉绀哄叧閿寚鏍囧拰鏈€鏂板姩鎬併€?/p>
            <!-- 杩欓噷鍙互娣诲姞鏇村姒傝鍐呭 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="浠诲姟" name="tasks">
          <div class="tab-content">
            <h3>浠诲姟鍒楄〃</h3>
            <p>椤圭洰浠诲姟绠＄悊鍔熻兘寮€鍙戜腑...</p>
            <!-- 杩欓噷鍙互娣诲姞浠诲姟鍒楄〃 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="鎴愬憳" name="members">
          <div class="tab-content">
            <h3>椤圭洰鎴愬憳</h3>
            <p>椤圭洰鎴愬憳绠＄悊鍔熻兘寮€鍙戜腑...</p>
            <!-- 杩欓噷鍙互娣诲姞鎴愬憳鍒楄〃 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="閲岀▼纰? name="milestones">
          <div class="tab-content">
            <h3>椤圭洰閲岀▼纰?/h3>
            <p>閲岀▼纰戠鐞嗗姛鑳藉紑鍙戜腑...</p>
            <!-- 杩欓噷鍙互娣诲姞閲岀▼纰?-->
          </div>
        </el-tab-pane>
        <el-tab-pane label="鏂囦欢" name="files">
          <div class="tab-content">
            <h3>椤圭洰鏂囦欢</h3>
            <p>鏂囦欢绠＄悊鍔熻兘寮€鍙戜腑...</p>
            <!-- 杩欓噷鍙互娣诲姞鏂囦欢鍒楄〃 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="璁剧疆" name="settings">
          <div class="tab-content">
            <h3>椤圭洰璁剧疆</h3>
            <p>椤圭洰璁剧疆鍔熻兘寮€鍙戜腑...</p>
            <!-- 杩欓噷鍙互娣诲姞璁剧疆琛ㄥ崟 -->
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  Share,
  More,
  DocumentCopy,
  Download,
  Delete,
  User,
  List,
  Check,
  Clock,
} from '@element-plus/icons-vue'
import { FolderDelete as Archive } from '@element-plus/icons-vue'
import type { Project } from '@/types/project'

const route = useRoute()
const router = useRouter()

// 鍝嶅簲寮忔暟鎹?const project = ref<Project>({
  id: Number(route.params.id) || 1,
  name: '缃戠珯閲嶆瀯椤圭洰',
  description:
    '瀵圭幇鏈夌綉绔欒繘琛岀幇浠ｅ寲閲嶆瀯锛屾彁鍗囩敤鎴蜂綋楠屻€傚寘鎷墠绔晫闈㈡洿鏂般€佸悗绔€ц兘浼樺寲鍜屾暟鎹簱杩佺Щ銆?,
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
})

const activeTab = ref('overview')
const progressColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
]

// 璁＄畻灞炴€?// const isProjectManager = computed(() => {
//   // 杩欓噷搴旇鏍规嵁鐢ㄦ埛鏉冮檺鍒ゆ柇
//   return true
// })

// 鏂规硶
const handleEdit = () => {
  ElMessage.info('缂栬緫椤圭洰鍔熻兘寮€鍙戜腑...')
}

const handleMoreCommand = (command: string) => {
  switch (command) {
    case 'duplicate':
      duplicateProject()
      break
    case 'export':
      exportProject()
      break
    case 'archive':
      archiveProject()
      break
    case 'delete':
      deleteProject()
      break
  }
}

const duplicateProject = () => {
  ElMessageBox.confirm('纭畾瑕佸鍒惰椤圭洰鍚楋紵', '澶嶅埗椤圭洰', { type: 'info' }).then(() => {
    ElMessage.success('椤圭洰澶嶅埗鎴愬姛')
  })
}

const exportProject = () => {
  ElMessage.info('椤圭洰瀵煎嚭鍔熻兘寮€鍙戜腑...')
}

const archiveProject = () => {
  ElMessageBox.confirm('纭畾瑕佸綊妗ｈ椤圭洰鍚楋紵褰掓。鍚庨」鐩皢鍙樹负鍙鐘舵€併€?, '褰掓。椤圭洰', {
    type: 'warning',
  }).then(() => {
    project.value.status = 'archived'
    ElMessage.success('椤圭洰宸插綊妗?)
  })
}

const deleteProject = () => {
  ElMessageBox.confirm('纭畾瑕佸垹闄よ椤圭洰鍚楋紵鍒犻櫎鍚庢暟鎹皢鏃犳硶鎭㈠銆?, '鍒犻櫎椤圭洰', {
    type: 'error',
    confirmButtonText: '鍒犻櫎',
  }).then(() => {
    ElMessage.success('椤圭洰宸插垹闄?)
    router.push('/projects')
  })
}

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

const formatDate = (dateString?: string) => {
  if (!dateString) return '鏈缃?
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const getRemainingDays = () => {
  if (!project.value.deadline) return '-'
  const deadline = new Date(project.value.deadline)
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

const isDeadlineNear = () => {
  if (!project.value.deadline) return false
  const deadline = new Date(project.value.deadline)
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 && diffDays <= 7
}

onMounted(() => {
  // 杩欓噷搴旇鏍规嵁璺敱鍙傛暟鍔犺浇椤圭洰鏁版嵁
  const projectId = route.params.id
  console.log('鍔犺浇椤圭洰鏁版嵁:', projectId)
})
</script>

<style scoped>
.project-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.project-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 30px;
  color: white;
  margin-bottom: 24px;
}

.project-header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-title-section {
  flex: 1;
}

.project-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
}

.project-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.project-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.project-description {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.9;
}

.project-stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.progress-card,
.stats-card,
.info-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.progress-content {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px;
}

.progress-details {
  flex: 1;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.progress-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stats-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 8px;
  border-radius: 8px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.info-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.owner-avatar {
  flex-shrink: 0;
}

.deadline-warning {
  color: var(--el-color-warning) !important;
  font-weight: 600;
}

.project-tabs {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.project-detail-tabs {
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

.tab-content p {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .project-header-main {
    flex-direction: column;
    gap: 16px;
  }

  .project-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .project-stats-cards {
    grid-template-columns: 1fr;
  }

  .progress-content {
    flex-direction: column;
    text-align: center;
  }

  .stats-content {
    grid-template-columns: 1fr;
  }
}
</style>
