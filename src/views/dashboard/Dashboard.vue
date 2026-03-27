<template>
  <div class="dashboard-container">
    <!-- 娆㈣繋妯箙 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1 class="welcome-title">娆㈣繋鍥炴潵锛寋{ username }}锛?/h1>
        <p class="welcome-subtitle">浠婂ぉ鏄?{{ currentDate }}锛岀鎮ㄥ伐浣滄剦蹇?/p>
      </div>
      <div class="welcome-actions">
        <el-button type="primary" size="large" @click="handleCreateTask">
          <el-icon><Plus /></el-icon>
          鍒涘缓鏂颁换鍔?        </el-button>
      </div>
    </div>

    <!-- 缁熻鍗＄墖 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #e6f7ff">
            <el-icon color="#1890ff"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.teams || 0 }}</div>
            <div class="stat-label">鎴戠殑鍥㈤槦</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #f6ffed">
            <el-icon color="#52c41a"><Folder /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.projects || 0 }}</div>
            <div class="stat-label">杩涜涓殑椤圭洰</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #fff7e6">
            <el-icon color="#fa8c16"><List /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.tasks || 0 }}</div>
            <div class="stat-label">寰呭姙浠诲姟</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #f9f0ff">
            <el-icon color="#722ed1"><Bell /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.notifications || 0 }}</div>
            <div class="stat-label">鏈閫氱煡</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 涓昏鍐呭鍖哄煙 -->
    <div class="main-grid">
      <!-- 鏈€杩戜换鍔?-->
      <el-card class="recent-tasks" shadow="never">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">鏈€杩戜换鍔?/h3>
            <el-button type="text" @click="goToTasks">鏌ョ湅鍏ㄩ儴</el-button>
          </div>
        </template>

        <div v-if="recentTasks.length > 0">
          <div
            v-for="task in recentTasks"
            :key="task.id"
            class="task-item"
            @click="viewTask(task.id)"
          >
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-meta">
                <span class="task-project">{{ task.project_name }}</span>
                <span class="task-due-date">
                  <el-icon><Clock /></el-icon>
                  {{ task.due_date }}
                </span>
              </div>
            </div>
            <el-tag :type="getStatusType(task.status)" size="small">
              {{ task.status }}
            </el-tag>
          </div>
        </div>
        <div v-else class="empty-state">
          <el-empty description="鏆傛棤浠诲姟" />
        </div>
      </el-card>

      <!-- 娲诲姩鏃堕棿绾?-->
      <el-card class="activity-timeline" shadow="never">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">鏈€杩戞椿鍔?/h3>
          </div>
        </template>

        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="activity.time"
            :type="activity.type"
            :icon="getActivityIcon(activity.type)"
          >
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-user">{{ activity.user }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>

        <div v-if="recentActivities.length === 0" class="empty-state">
          <el-empty description="鏆傛棤娲诲姩璁板綍" />
        </div>
      </el-card>
    </div>

    <!-- 蹇€熸搷浣?-->
    <el-card class="quick-actions" shadow="never">
      <template #header>
        <h3 class="card-title">蹇€熸搷浣?/h3>
      </template>

      <div class="actions-grid">
        <div class="action-item" @click="goToTeams">
          <div class="action-icon" style="background: #e6f7ff">
            <el-icon color="#1890ff"><User /></el-icon>
          </div>
          <div class="action-text">鍒涘缓鍥㈤槦</div>
        </div>

        <div class="action-item" @click="goToProjects">
          <div class="action-icon" style="background: #f6ffed">
            <el-icon color="#52c41a"><Folder /></el-icon>
          </div>
          <div class="action-text">鏂板缓椤圭洰</div>
        </div>

        <div class="action-item" @click="goToTasks">
          <div class="action-icon" style="background: #fff7e6">
            <el-icon color="#fa8c16"><List /></el-icon>
          </div>
          <div class="action-text">鍒嗛厤浠诲姟</div>
        </div>

        <div class="action-item" @click="goToProfile">
          <div class="action-icon" style="background: #f9f0ff">
            <el-icon color="#722ed1"><Setting /></el-icon>
          </div>
          <div class="action-text">涓汉璁剧疆</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  User,
  Folder,
  List,
  Bell,
  Plus,
  Clock,
  Check,
  Edit,
  Message,
  Setting,
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 鐢ㄦ埛淇℃伅
const username = computed(() => authStore.username || '鐢ㄦ埛')

// 褰撳墠鏃ユ湡
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

// 缁熻鏁版嵁
const stats = ref({
  teams: 0,
  projects: 0,
  tasks: 0,
  notifications: 0,
})

// 鏈€杩戜换鍔?const recentTasks = ref([
  {
    id: 1,
    title: '璁捐鐢ㄦ埛鐣岄潰鍘熷瀷',
    project_name: 'TaskFlow 椤圭洰',
    due_date: '鏄庡ぉ',
    status: '杩涜涓?,
  },
  {
    id: 2,
    title: '缂栧啓API鏂囨。',
    project_name: '鍚庣寮€鍙?,
    due_date: '3澶╁悗',
    status: '寰呭紑濮?,
  },
  {
    id: 3,
    title: '娴嬭瘯鐢ㄦ埛璁よ瘉娴佺▼',
    project_name: '璐ㄩ噺淇濊瘉',
    due_date: '宸插畬鎴?,
    status: '宸插畬鎴?,
  },
])

// 鏈€杩戞椿鍔?const recentActivities = ref([
  {
    id: 1,
    type: 'success',
    time: '10鍒嗛挓鍓?,
    text: '瀹屾垚浜?璁捐鐢ㄦ埛鐣岄潰鍘熷瀷"浠诲姟',
    user: '寮犱笁',
  },
  {
    id: 2,
    type: 'primary',
    time: '1灏忔椂鍓?,
    text: '鍒涘缓浜嗘柊椤圭洰"鍚庣寮€鍙?',
    user: '鏉庡洓',
  },
  {
    id: 3,
    type: 'warning',
    time: '2灏忔椂鍓?,
    text: '璇勮浜?API璁捐璁ㄨ"',
    user: '鐜嬩簲',
  },
])

// 鑾峰彇鐘舵€佺被鍨?const getStatusType = (status: string) => {
  switch (status) {
    case '宸插畬鎴?:
      return 'success'
    case '杩涜涓?:
      return 'primary'
    case '寰呭紑濮?:
      return 'warning'
    default:
      return 'info'
  }
}

// 鑾峰彇娲诲姩鍥炬爣
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'success':
      return Check
    case 'primary':
      return Edit
    case 'warning':
      return Message
    default:
      return Check
  }
}

// 瀵艰埅鏂规硶
const goToTeams = () => {
  router.push('/teams')
}

const goToProjects = () => {
  router.push('/projects')
}

const goToTasks = () => {
  router.push('/tasks')
}

const goToProfile = () => {
  router.push('/profile')
}

const handleCreateTask = () => {
  // TODO: 鎵撳紑鍒涘缓浠诲姟瀵硅瘽妗?  console.log('鍒涘缓鏂颁换鍔?)
}

const viewTask = (taskId: number) => {
  router.push(`/tasks/${taskId}`)
}

// 妯℃嫙鍔犺浇鏁版嵁
onMounted(() => {
  // TODO: 浠嶢PI鍔犺浇鐪熷疄鏁版嵁
  setTimeout(() => {
    stats.value = {
      teams: 3,
      projects: 8,
      tasks: 12,
      notifications: 5,
    }
  }, 500)
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 娆㈣繋妯箙 */
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

/* 缁熻鍗＄墖 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.stat-card {
  border-radius: 12px;
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* 涓昏鍐呭鍖哄煙 */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 浠诲姟鍒楄〃 */
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 8px;
}

.task-item:hover {
  background-color: #f5f7fa;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-info {
  flex: 1;
}

.task-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.task-project {
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.task-due-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 娲诲姩鏃堕棿绾?*/
.activity-content {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
}

.activity-text {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.activity-user {
  font-size: 12px;
  color: #909399;
}

/* 蹇€熸搷浣?*/
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  border-radius: 12px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background: #e4e7ed;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 12px;
}

.action-text {
  font-weight: 500;
  color: #303133;
}

/* 绌虹姸鎬?*/
.empty-state {
  padding: 40px 0;
}

/* 鍝嶅簲寮忚璁?*/
@media (max-width: 768px) {
  .welcome-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
