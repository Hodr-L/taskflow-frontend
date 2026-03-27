<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎回来，{{ username }}！</h1>
        <p class="welcome-subtitle">今天是 {{ currentDate }}，祝您工作愉快</p>
      </div>
      <div class="welcome-actions">
        <el-button type="primary" size="large" @click="handleCreateTask">
          <el-icon><Plus /></el-icon>
          创建新任务
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #e6f7ff">
            <el-icon color="#1890ff"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.teams || 0 }}</div>
            <div class="stat-label">我的团队</div>
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
            <div class="stat-label">进行中的项目</div>
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
            <div class="stat-label">待办任务</div>
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
            <div class="stat-label">未读通知</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-grid">
      <!-- 最近任务 -->
      <el-card class="recent-tasks" shadow="never">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">最近任务</h3>
            <el-button type="text" @click="goToTasks">查看全部</el-button>
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
          <el-empty description="暂无任务" />
        </div>
      </el-card>

      <!-- 活动时间线 -->
      <el-card class="activity-timeline" shadow="never">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">最近活动</h3>
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
          <el-empty description="暂无活动记录" />
        </div>
      </el-card>
    </div>

    <!-- 快速操作 -->
    <el-card class="quick-actions" shadow="never">
      <template #header>
        <h3 class="card-title">快速操作</h3>
      </template>

      <div class="actions-grid">
        <div class="action-item" @click="goToTeams">
          <div class="action-icon" style="background: #e6f7ff">
            <el-icon color="#1890ff"><User /></el-icon>
          </div>
          <div class="action-text">创建团队</div>
        </div>

        <div class="action-item" @click="goToProjects">
          <div class="action-icon" style="background: #f6ffed">
            <el-icon color="#52c41a"><Folder /></el-icon>
          </div>
          <div class="action-text">新建项目</div>
        </div>

        <div class="action-item" @click="goToTasks">
          <div class="action-icon" style="background: #fff7e6">
            <el-icon color="#fa8c16"><List /></el-icon>
          </div>
          <div class="action-text">分配任务</div>
        </div>

        <div class="action-item" @click="goToProfile">
          <div class="action-icon" style="background: #f9f0ff">
            <el-icon color="#722ed1"><Setting /></el-icon>
          </div>
          <div class="action-text">个人设置</div>
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

// 用户信息
const username = computed(() => authStore.username || '用户')

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

// 统计数据
const stats = ref({
  teams: 0,
  projects: 0,
  tasks: 0,
  notifications: 0,
})

// 最近任务
const recentTasks = ref([
  {
    id: 1,
    title: '设计用户界面原型',
    project_name: 'TaskFlow 项目',
    due_date: '明天',
    status: '进行中',
  },
  {
    id: 2,
    title: '编写API文档',
    project_name: '后端开发',
    due_date: '3天后',
    status: '待开始',
  },
  {
    id: 3,
    title: '测试用户认证流程',
    project_name: '质量保证',
    due_date: '已完成',
    status: '已完成',
  },
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    type: 'success',
    time: '10分钟前',
    text: '完成了"设计用户界面原型"任务',
    user: '张三',
  },
  {
    id: 2,
    type: 'primary',
    time: '1小时前',
    text: '创建了新项目"后端开发"',
    user: '李四',
  },
  {
    id: 3,
    type: 'warning',
    time: '2小时前',
    text: '评论了"API设计讨论"',
    user: '王五',
  },
])

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case '已完成':
      return 'success'
    case '进行中':
      return 'primary'
    case '待开始':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取活动图标
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

// 导航方法
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
  // TODO: 打开创建任务对话框
  console.log('创建新任务')
}

const viewTask = (taskId: number) => {
  router.push(`/tasks/${taskId}`)
}

// 模拟加载数据
onMounted(() => {
  // TODO: 从API加载真实数据
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

/* 欢迎横幅 */
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

/* 统计卡片 */
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

/* 主要内容区域 */
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

/* 任务列表 */
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

/* 活动时间线 */
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

/* 快速操作 */
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

/* 空状态 */
.empty-state {
  padding: 40px 0;
}

/* 响应式设计 */
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
