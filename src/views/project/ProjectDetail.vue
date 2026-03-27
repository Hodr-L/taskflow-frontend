<template>
  <div class="project-detail-container">
    <!-- 项目头部 -->
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
          <el-button type="primary" :icon="Edit" @click="handleEdit">编辑项目</el-button>
          <el-button :icon="Share">分享</el-button>
          <el-dropdown @command="handleMoreCommand">
            <el-button :icon="More">更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="DocumentCopy" command="duplicate"
                  >复制项目</el-dropdown-item
                >
                <el-dropdown-item :icon="Download" command="export">导出项目</el-dropdown-item>
                <el-dropdown-item :icon="Archive" command="archive">归档项目</el-dropdown-item>
                <el-dropdown-item divided :icon="Delete" command="delete"
                  >删除项目</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="project-description">
        <p>{{ project.description || '暂无项目描述' }}</p>
      </div>
    </div>

    <!-- 项目进度和统计 -->
    <div class="project-stats-cards">
      <el-card class="progress-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">项目进度</span>
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
              <span class="progress-label">已完成</span>
              <span class="progress-value"
                >{{ project.completed_tasks_count || 0 }} / {{ project.tasks_count || 0 }}</span
              >
            </div>
            <div class="progress-text">
              <span class="progress-label">剩余时间</span>
              <span class="progress-value">{{ getRemainingDays() }} 天</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">项目统计</span>
          </div>
        </template>
        <div class="stats-content">
          <div class="stat-item">
            <el-icon class="stat-icon"><User /></el-icon>
            <div class="stat-info">
              <span class="stat-label">成员</span>
              <span class="stat-value">{{ project.members_count || 0 }} 人</span>
            </div>
          </div>
          <div class="stat-item">
            <el-icon class="stat-icon"><List /></el-icon>
            <div class="stat-info">
              <span class="stat-label">任务总数</span>
              <span class="stat-value">{{ project.tasks_count || 0 }}</span>
            </div>
          </div>
          <div class="stat-item">
            <el-icon class="stat-icon"><Check /></el-icon>
            <div class="stat-info">
              <span class="stat-label">已完成</span>
              <span class="stat-value">{{ project.completed_tasks_count || 0 }}</span>
            </div>
          </div>
          <div class="stat-item">
            <el-icon class="stat-icon"><Clock /></el-icon>
            <div class="stat-info">
              <span class="stat-label">进行中</span>
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
            <span class="card-title">项目信息</span>
          </div>
        </template>
        <div class="info-content">
          <div class="info-item">
            <span class="info-label">负责人</span>
            <div class="info-value">
              <el-avatar :size="24" :src="project.owner?.avatar_url" class="owner-avatar">
                {{
                  project.owner?.fullname?.substring(0, 1) ||
                  project.owner?.username?.substring(0, 1) ||
                  'U'
                }}
              </el-avatar>
              <span>{{ project.owner?.fullname || project.owner?.username || '未知用户' }}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">开始日期</span>
            <span class="info-value">{{ formatDate(project.start_date) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">截止日期</span>
            <span class="info-value" :class="{ 'deadline-warning': isDeadlineNear() }">
              {{ formatDate(project.deadline) || '未设置' }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ formatDate(project.created_at) }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 选项卡 -->
    <div class="project-tabs">
      <el-tabs v-model="activeTab" class="project-detail-tabs">
        <el-tab-pane label="概览" name="overview">
          <div class="tab-content">
            <h3>项目概览</h3>
            <p>这里是项目的概览信息，显示关键指标和最新动态。</p>
            <!-- 这里可以添加更多概览内容 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="任务" name="tasks">
          <div class="tab-content">
            <h3>任务列表</h3>
            <p>项目任务管理功能开发中...</p>
            <!-- 这里可以添加任务列表 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="成员" name="members">
          <div class="tab-content">
            <h3>项目成员</h3>
            <p>项目成员管理功能开发中...</p>
            <!-- 这里可以添加成员列表 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="里程碑" name="milestones">
          <div class="tab-content">
            <h3>项目里程碑</h3>
            <p>里程碑管理功能开发中...</p>
            <!-- 这里可以添加里程碑 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="文件" name="files">
          <div class="tab-content">
            <h3>项目文件</h3>
            <p>文件管理功能开发中...</p>
            <!-- 这里可以添加文件列表 -->
          </div>
        </el-tab-pane>
        <el-tab-pane label="设置" name="settings">
          <div class="tab-content">
            <h3>项目设置</h3>
            <p>项目设置功能开发中...</p>
            <!-- 这里可以添加设置表单 -->
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

// 响应式数据
const project = ref<Project>({
  id: Number(route.params.id) || 1,
  name: '网站重构项目',
  description:
    '对现有网站进行现代化重构，提升用户体验。包括前端界面更新、后端性能优化和数据库迁移。',
  team_id: 1,
  owner_id: 1,
  status: 'active',
  priority: 'high',
  progress: 65,
  start_date: '2026-03-01',
  deadline: '2026-04-30',
  budget: 50000,
  actual_cost: 32000,
  tags: ['前端', '后端', '设计'],
  members_count: 8,
  tasks_count: 45,
  completed_tasks_count: 29,
  created_at: '2026-03-01T10:00:00Z',
  owner: {
    id: 1,
    username: 'admin',
    fullname: '管理员',
    avatar_url: 'https://via.placeholder.com/50',
  },
  team: {
    id: 1,
    name: '研发部',
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

// 计算属性
// const isProjectManager = computed(() => {
//   // 这里应该根据用户权限判断
//   return true
// })

// 方法
const handleEdit = () => {
  ElMessage.info('编辑项目功能开发中...')
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
  ElMessageBox.confirm('确定要复制该项目吗？', '复制项目', { type: 'info' }).then(() => {
    ElMessage.success('项目复制成功')
  })
}

const exportProject = () => {
  ElMessage.info('项目导出功能开发中...')
}

const archiveProject = () => {
  ElMessageBox.confirm('确定要归档该项目吗？归档后项目将变为只读状态。', '归档项目', {
    type: 'warning',
  }).then(() => {
    project.value.status = 'archived'
    ElMessage.success('项目已归档')
  })
}

const deleteProject = () => {
  ElMessageBox.confirm('确定要删除该项目吗？删除后数据将无法恢复。', '删除项目', {
    type: 'error',
    confirmButtonText: '删除',
  }).then(() => {
    ElMessage.success('项目已删除')
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
    planning: '规划中',
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    archived: '已归档',
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
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  }
  return map[priority] || priority
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '未设置'
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
  // 这里应该根据路由参数加载项目数据
  const projectId = route.params.id
  console.log('加载项目数据:', projectId)
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
