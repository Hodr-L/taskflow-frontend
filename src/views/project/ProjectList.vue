<template>
  <div class="project-list-container">
    <div class="project-header">
      <h2 class="project-title">项目管理</h2>
      <p class="project-subtitle">创建和管理项目，跟踪进度</p>

      <div class="project-actions">
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建项目
        </el-button>
      </div>
    </div>

    <!-- 过滤和搜索 -->
    <div class="project-filters">
      <el-input
        v-model="searchText"
        placeholder="搜索项目名称或描述"
        clearable
        class="search-input"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterStatus" placeholder="状态" clearable @change="handleFilter">
        <el-option label="规划中" value="planning" />
        <el-option label="进行中" value="active" />
        <el-option label="已暂停" value="paused" />
        <el-option label="已完成" value="completed" />
        <el-option label="已归档" value="archived" />
      </el-select>

      <el-select v-model="filterPriority" placeholder="优先级" clearable @change="handleFilter">
        <el-option label="低" value="low" />
        <el-option label="中" value="medium" />
        <el-option label="高" value="high" />
        <el-option label="紧急" value="urgent" />
      </el-select>
    </div>

    <!-- 项目列表 -->
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
                  <el-dropdown-item command="edit">编辑项目</el-dropdown-item>
                  <el-dropdown-item command="members">管理成员</el-dropdown-item>
                  <el-dropdown-item command="tasks">查看任务</el-dropdown-item>
                  <el-dropdown-item divided command="archive">归档项目</el-dropdown-item>
                  <el-dropdown-item command="delete">删除项目</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>

        <div class="project-description">
          {{ project.description || '暂无描述' }}
        </div>

        <div class="project-progress">
          <div class="progress-info">
            <span>进度</span>
            <span class="progress-percent">{{ project.progress }}%</span>
          </div>
          <el-progress :percentage="project.progress" :show-text="false" />
        </div>

        <div class="project-stats">
          <div class="stat-item">
            <el-icon><User /></el-icon>
            <span>{{ project.members_count || 0 }} 成员</span>
          </div>
          <div class="stat-item">
            <el-icon><List /></el-icon>
            <span>{{ project.tasks_count || 0 }} 任务</span>
          </div>
          <div class="stat-item">
            <el-icon><Check /></el-icon>
            <span>{{ project.completed_tasks_count || 0 }} 完成</span>
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
              project.owner?.fullname || project.owner?.username || '未知用户'
            }}</span>
          </div>
          <div class="project-date">
            <el-icon><Calendar /></el-icon>
            <span v-if="project.deadline">截止: {{ formatDate(project.deadline) }}</span>
            <span v-else>无截止日期</span>
          </div>
        </div>
      </el-card>

      <!-- 空状态 -->
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <el-empty description="暂无项目">
          <el-button type="primary" @click="showCreateDialog = true"> 创建第一个项目 </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 创建项目对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建项目"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="项目名称" prop="name">
          <el-input
            v-model="createForm.name"
            placeholder="请输入项目名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="所属团队" prop="team_id">
          <el-select v-model="createForm.team_id" placeholder="请选择团队" style="width: 100%">
            <el-option
              v-for="team in availableTeams"
              :key="team.id"
              :label="team.name"
              :value="team.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="项目状态" prop="status">
          <el-select v-model="createForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="规划中" value="planning" />
            <el-option label="进行中" value="active" />
            <el-option label="已暂停" value="paused" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="createForm.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>

        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="createForm.deadline"
            type="date"
            placeholder="选择截止日期"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleCreateSubmit" :loading="creating">
            创建
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

// 响应式数据
const projects = ref<Project[]>([
  {
    id: 1,
    name: '网站重构项目',
    description: '对现有网站进行现代化重构，提升用户体验',
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
  },
  {
    id: 2,
    name: '移动应用开发',
    description: '开发全新的跨平台移动应用',
    team_id: 2,
    owner_id: 2,
    status: 'planning',
    priority: 'urgent',
    progress: 20,
    start_date: '2026-03-15',
    deadline: '2026-06-30',
    budget: 80000,
    actual_cost: 15000,
    tags: ['移动端', 'React Native', 'UI设计'],
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
      name: '移动开发组',
    },
  },
  {
    id: 3,
    name: '数据迁移项目',
    description: '将旧系统数据迁移到新平台',
    team_id: 1,
    owner_id: 3,
    status: 'completed',
    priority: 'medium',
    progress: 100,
    start_date: '2026-02-01',
    deadline: '2026-03-15',
    budget: 30000,
    actual_cost: 28000,
    tags: ['数据库', '迁移', 'ETL'],
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
      name: '研发部',
    },
  },
])

const availableTeams = ref<Team[]>([
  {
    id: 1,
    name: '研发部',
    description: '技术研发团队',
    owner_id: 1,
    privacy: 'private',
    created_at: '2026-01-01',
  },
  {
    id: 2,
    name: '移动开发组',
    description: '移动应用开发',
    owner_id: 2,
    privacy: 'private',
    created_at: '2026-01-15',
  },
  {
    id: 3,
    name: '设计部',
    description: 'UI/UX设计',
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
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  description: [{ max: 200, message: '不能超过 200 个字符', trigger: 'blur' }],
  team_id: [{ required: true, message: '请选择所属团队', trigger: 'change' }],
}

// 计算属性
const filteredProjects = computed(() => {
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

// 方法
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const handleFilter = () => {
  // 过滤逻辑已通过计算属性实现
}

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
  ElMessage.info(`编辑项目: ${project.name}`)
  // TODO: 实现编辑功能
}

const manageMembers = (projectId: number) => {
  ElMessage.info(`管理项目成员: ${projectId}`)
  // TODO: 实现成员管理
}

const viewTasks = (projectId: number) => {
  router.push(`/tasks?project_id=${projectId}`)
}

const archiveProject = (projectId: number) => {
  ElMessageBox.confirm('确定要归档该项目吗？归档后项目将变为只读状态。', '确认归档', {
    type: 'warning',
  }).then(() => {
    const project = projects.value.find((p) => p.id === projectId)
    if (project) {
      project.status = 'archived'
      ElMessage.success('项目已归档')
    }
  })
}

const deleteProject = (projectId: number) => {
  ElMessageBox.confirm('确定要删除该项目吗？删除后数据将无法恢复。', '确认删除', {
    type: 'error',
    confirmButtonText: '删除',
  }).then(() => {
    projects.value = projects.value.filter((p) => p.id !== projectId)
    ElMessage.success('项目已删除')
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

      // 模拟API调用延迟
      setTimeout(() => {
        const newProject: Project = {
          id: projects.value.length + 1,
          name: createForm.value.name,
          description: createForm.value.description,
          team_id: createForm.value.team_id,
          owner_id: 1, // 当前用户ID
          status: createForm.value.status as any,
          priority: createForm.value.priority as any,
          progress: 0,
          deadline: createForm.value.deadline,
          tags: [],
          created_at: new Date().toISOString(),
          owner: {
            id: 1,
            username: 'currentuser',
            fullname: '当前用户',
          },
          team: availableTeams.value.find((t) => t.id === createForm.value.team_id),
        }

        projects.value.unshift(newProject)
        creating.value = false
        showCreateDialog.value = false
        createFormRef.value?.resetFields()
        ElMessage.success('项目创建成功')
      }, 1000)
    }
  })
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 // 禁用今天之前的日期
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  // 可以在这里加载项目数据
})
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
