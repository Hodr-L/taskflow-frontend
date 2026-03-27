<template>
  <div class="task-list-container">
    <div class="task-header">
      <h2 class="task-title">任务管理</h2>
      <p class="task-subtitle">创建、分配和跟踪任务进度</p>

      <div class="task-actions">
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建任务
        </el-button>
      </div>
    </div>

    <!-- 过滤和搜索 -->
    <div class="task-filters">
      <el-input
        v-model="searchText"
        placeholder="搜索任务标题或描述"
        clearable
        class="search-input"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
        v-model="filterStatus"
        placeholder="状态"
        clearable
        @change="handleFilter"
        multiple
      >
        <el-option label="待处理" value="todo" />
        <el-option label="进行中" value="in_progress" />
        <el-option label="审核中" value="review" />
        <el-option label="已完成" value="done" />
      </el-select>

      <el-select
        v-model="filterPriority"
        placeholder="优先级"
        clearable
        @change="handleFilter"
        multiple
      >
        <el-option label="低" value="low" />
        <el-option label="中" value="medium" />
        <el-option label="高" value="high" />
        <el-option label="紧急" value="urgent" />
      </el-select>

      <el-select v-model="filterAssignee" placeholder="负责人" clearable @change="handleFilter">
        <el-option
          v-for="user in availableUsers"
          :key="user.id"
          :label="user.full_name || user.username"
          :value="user.id"
        />
      </el-select>

      <el-select v-model="filterProject" placeholder="项目" clearable @change="handleFilter">
        <el-option
          v-for="project in availableProjects"
          :key="project.id"
          :label="project.name"
          :value="project.id"
        />
      </el-select>
    </div>

    <!-- 任务列表 -->
    <div class="task-content">
      <!-- 任务统计卡片 -->
      <div class="task-stats">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-number">{{ taskStatistics.total_tasks || 0 }}</span>
            <span class="stat-label">总任务数</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-number" style="color: #e6a23c">{{
              taskStatistics.todo_tasks || 0
            }}</span>
            <span class="stat-label">待处理</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-number" style="color: #1989fa">{{
              taskStatistics.in_progress_tasks || 0
            }}</span>
            <span class="stat-label">进行中</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-number" style="color: #67c23a">{{
              taskStatistics.done_tasks || 0
            }}</span>
            <span class="stat-label">已完成</span>
          </div>
        </el-card>
      </div>

      <!-- 任务表格 -->
      <el-card class="task-table-card">
        <template #header>
          <div class="table-header">
            <span class="table-title">任务列表</span>
            <div class="table-actions">
              <el-button :icon="Refresh" @click="refreshTasks">刷新</el-button>
              <el-dropdown @command="handleTableCommand">
                <el-button :icon="Setting">视图</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="compact">紧凑视图</el-dropdown-item>
                    <el-dropdown-item command="normal">标准视图</el-dropdown-item>
                    <el-dropdown-item divided command="export">导出CSV</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>

        <el-table
          :data="filteredTasks"
          :row-class-name="tableRowClassName"
          @row-click="viewTask"
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="标题" min-width="200">
            <template #default="{ row }">
              <div class="task-title-cell">
                <span class="task-title-text">{{ row.title }}</span>
                <div class="task-tags">
                  <el-tag
                    v-for="tag in row.tags.slice(0, 2)"
                    :key="tag"
                    size="small"
                    class="task-tag"
                  >
                    {{ tag }}
                  </el-tag>
                  <span v-if="row.tags.length > 2" class="more-tags">
                    +{{ row.tags.length - 2 }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small" effect="light">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="120">
            <template #default="{ row }">
              <el-tag :type="getPriorityTagType(row.priority)" size="small" effect="light">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="负责人" width="150">
            <template #default="{ row }">
              <div v-if="row.assignee" class="assignee-cell">
                <el-avatar :size="24" :src="row.assignee.avatar_url">
                  {{
                    row.assignee.fullname?.substring(0, 1) ||
                    row.assignee.username?.substring(0, 1) ||
                    'U'
                  }}
                </el-avatar>
                <span class="assignee-name">{{
                  row.assignee.fullname || row.assignee.username
                }}</span>
              </div>
              <span v-else class="no-assignee">未分配</span>
            </template>
          </el-table-column>
          <el-table-column label="项目" width="150">
            <template #default="{ row }">
              <span v-if="row.project">{{ row.project.name }}</span>
              <span v-else class="no-project">无项目</span>
            </template>
          </el-table-column>
          <el-table-column label="截止日期" width="120">
            <template #default="{ row }">
              <span :class="{ 'deadline-warning': isDeadlineNear(row.due_date) }">
                {{ formatDate(row.due_date) || '无' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click.stop="viewTask(row.id)"
                >查看</el-button
              >
              <el-button type="info" link size="small" @click.stop="editTask(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click.stop="deleteTask(row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="filteredTasks.length"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建任务"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="任务标题" prop="title">
          <el-input
            v-model="createForm.title"
            placeholder="请输入任务标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select
                v-model="createForm.priority"
                placeholder="请选择优先级"
                style="width: 100%"
              >
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="紧急" value="urgent" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型" prop="type">
              <el-select v-model="createForm.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="功能" value="feature" />
                <el-option label="缺陷" value="bug" />
                <el-option label="改进" value="improvement" />
                <el-option label="文档" value="documentation" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人" prop="assignee_id">
              <el-select
                v-model="createForm.assignee_id"
                placeholder="请选择负责人"
                style="width: 100%"
              >
                <el-option
                  v-for="user in availableUsers"
                  :key="user.id"
                  :label="user.fullname || user.username"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目" prop="project_id">
              <el-select
                v-model="createForm.project_id"
                placeholder="请选择项目"
                style="width: 100%"
              >
                <el-option
                  v-for="project in availableProjects"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预计工时" prop="estimate_hours">
              <el-input-number
                v-model="createForm.estimate_hours"
                :min="0"
                :step="0.5"
                style="width: 100%"
                placeholder="请输入预计工时"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期" prop="due_date">
              <el-date-picker
                v-model="createForm.due_date"
                type="date"
                placeholder="选择截止日期"
                style="width: 100%"
                :disabled-date="disabledDate"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="createForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请添加任务标签"
            style="width: 100%"
          >
            <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
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
import { Plus, Search, Refresh, Setting } from '@element-plus/icons-vue'
import type { Task, TaskStatistics } from '@/types/task'
import type { Project } from '@/types/project'
import type { User as UserType } from '@/types/user'

const router = useRouter()

// 响应式数据
const tasks = ref<Task[]>([
  {
    id: 1,
    title: '设计登录页面',
    description: '完成登录页面的UI设计，包括响应式布局',
    project_id: 1,
    assignee_id: 1,
    reporter_id: 2,
    status: 'in_progress',
    priority: 'high',
    type: 'feature',
    estimate_hours: 8,
    actual_hours: 4,
    due_date: '2026-03-25',
    tags: ['前端', 'UI', '设计'],
    created_at: '2026-03-20T10:00:00Z',
    assignee: {
      id: 1,
      username: 'designer',
      fullname: '设计师',
      bio: 'UI/UX设计师',
      avatar_url: 'https://via.placeholder.com/50',
    },
    reporter: {
      id: 2,
      username: 'pm',
      fullname: '产品经理',
      bio: '产品经理',
    },
    project: {
      id: 1,
      name: '网站重构项目',
    },
  },
  {
    id: 2,
    title: '修复注册页面验证错误',
    description: '解决注册表单的邮箱验证逻辑问题',
    project_id: 1,
    assignee_id: 3,
    reporter_id: 2,
    status: 'todo',
    priority: 'urgent',
    type: 'bug',
    estimate_hours: 4,
    due_date: '2026-03-22',
    tags: ['后端', '验证', '修复'],
    created_at: '2026-03-20T09:30:00Z',
    assignee: {
      id: 3,
      username: 'developer',
      fullname: '开发工程师',
      bio: '后端开发工程师',
    },
    reporter: {
      id: 2,
      username: 'pm',
      fullname: '产品经理',
      bio: '产品经理',
    },
    project: {
      id: 1,
      name: '网站重构项目',
    },
  },
  {
    id: 3,
    title: '编写API文档',
    description: '为用户认证API编写详细的使用文档',
    project_id: 2,
    assignee_id: 4,
    reporter_id: 1,
    status: 'review',
    priority: 'medium',
    type: 'documentation',
    estimate_hours: 12,
    actual_hours: 10,
    due_date: '2026-03-28',
    tags: ['文档', 'API'],
    created_at: '2026-03-19T14:20:00Z',
    assignee: {
      id: 4,
      username: 'techwriter',
      fullname: '技术文档工程师',
    },
    reporter: {
      id: 1,
      username: 'designer',
      fullname: '设计师',
    },
    project: {
      id: 2,
      name: '移动应用开发',
    },
  },
  {
    id: 4,
    title: '数据库性能优化',
    description: '优化用户查询的数据库索引',
    project_id: 1,
    assignee_id: 5,
    reporter_id: 2,
    status: 'done',
    priority: 'high',
    type: 'improvement',
    estimate_hours: 16,
    actual_hours: 20,
    due_date: '2026-03-18',
    completed_at: '2026-03-18T16:45:00Z',
    tags: ['数据库', '优化', '性能'],
    created_at: '2026-03-15T11:10:00Z',
    assignee: {
      id: 5,
      username: 'dba',
      fullname: '数据库管理员',
      bio: '数据库管理员',
    },
    reporter: {
      id: 2,
      username: 'pm',
      fullname: '产品经理',
      bio: '产品经理',
    },
    project: {
      id: 1,
      name: '网站重构项目',
    },
  },
])

const availableUsers = ref<UserType[]>([
  {
    id: 1,
    username: 'designer',
    fullname: '设计师',
    bio: 'UI/UX设计师',
    email: 'designer@example.com',
    role: 'designer',
  },
  { id: 2, username: 'pm', fullname: '产品经理', bio: '产品经理', email: 'pm@example.com', role: 'pm' },
  {
    id: 3,
    username: 'developer',
    fullname: '开发工程师',
    bio: '后端开发工程师',
    email: 'developer@example.com',
    role: 'developer',
  },
  {
    id: 4,
    username: 'techwriter',
    fullname: '技术文档工程师',
    bio: '技术文档工程师',
    email: 'writer@example.com',
    role: 'writer',
  },
  { id: 5, username: 'dba', fullname: '数据库管理员', bio: '数据库管理员', email: 'dba@example.com', role: 'dba' },
])

const availableProjects = ref<Project[]>([
  {
    id: 1,
    name: '网站重构项目',
    description: '',
    owner_id: 1,
    status: 'active',
    priority: 'high',
    progress: 65,
    tags: [],
    created_at: '',
  },
  {
    id: 2,
    name: '移动应用开发',
    description: '',
    owner_id: 2,
    status: 'planning',
    priority: 'urgent',
    progress: 20,
    tags: [],
    created_at: '',
  },
  {
    id: 3,
    name: '数据迁移项目',
    description: '',
    owner_id: 3,
    status: 'completed',
    priority: 'medium',
    progress: 100,
    tags: [],
    created_at: '',
  },
])

const availableTags = ref<string[]>([
  '前端',
  '后端',
  'UI',
  '设计',
  '数据库',
  'API',
  '文档',
  '测试',
  '优化',
  '性能',
  '安全',
  '部署',
  '移动端',
  'Web端',
  'Bug',
  '功能',
])

const searchText = ref('')
const filterStatus = ref<string[]>([])
const filterPriority = ref<string[]>([])
const filterAssignee = ref<number | undefined>(undefined)
const filterProject = ref<number | undefined>(undefined)
const showCreateDialog = ref(false)
const creating = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)

const createForm = ref({
  title: '',
  description: '',
  priority: 'medium',
  type: 'feature',
  assignee_id: undefined as number | undefined,
  project_id: undefined as number | undefined,
  estimate_hours: undefined as number | undefined,
  due_date: '',
  tags: [] as string[],
})

const createFormRef = ref<FormInstance>()
const createRules: FormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
}

// 计算属性
const filteredTasks = computed(() => {
  let result = tasks.value

  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(
      (task) =>
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search),
    )
  }

  // 状态过滤
  if (filterStatus.value.length > 0) {
    result = result.filter((task) => filterStatus.value.includes(task.status))
  }

  // 优先级过滤
  if (filterPriority.value.length > 0) {
    result = result.filter((task) => filterPriority.value.includes(task.priority))
  }

  // 负责人过滤
  if (filterAssignee.value) {
    result = result.filter((task) => task.assignee_id === filterAssignee.value)
  }

  // 项目过滤
  if (filterProject.value) {
    result = result.filter((task) => task.project_id === filterProject.value)
  }

  return result
})

const taskStatistics = computed<TaskStatistics>(() => {
  const total = tasks.value.length
  const todo = tasks.value.filter((t) => t.status === 'todo').length
  const inProgress = tasks.value.filter((t) => t.status === 'in_progress').length
  const review = tasks.value.filter((t) => t.status === 'review').length
  const done = tasks.value.filter((t) => t.status === 'done').length

  // 计算逾期任务
  const today = new Date()
  const overdue = tasks.value.filter((task) => {
    if (!task.due_date || task.status === 'done') return false
    const dueDate = new Date(task.due_date)
    return dueDate < today
  }).length

  // 计算总预估和实际工时
  const totalEstimate = tasks.value.reduce((sum, task) => sum + (task.estimate_hours || 0), 0)
  const totalActual = tasks.value.reduce((sum, task) => sum + (task.actual_hours || 0), 0)

  // 计算完成率
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

  return {
    total_tasks: total,
    todo_tasks: todo,
    in_progress_tasks: inProgress,
    review_tasks: review,
    done_tasks: done,
    overdue_tasks: overdue,
    total_estimate_hours: totalEstimate,
    total_actual_hours: totalActual,
    completion_rate: completionRate,
  }
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
  currentPage.value = 1 // 重置到第一页
}

const handleFilter = () => {
  currentPage.value = 1 // 重置到第一页
}

const refreshTasks = () => {
  ElMessage.success('任务列表已刷新')
  // 这里应该调用API重新加载任务
}

const handleTableCommand = (command: string) => {
  switch (command) {
    case 'compact':
      ElMessage.info('切换为紧凑视图')
      break
    case 'normal':
      ElMessage.info('切换为标准视图')
      break
    case 'export':
      exportTasks()
      break
  }
}

const exportTasks = () => {
  ElMessage.info('导出功能开发中...')
}

const viewTask = (task: Task | number) => {
  const taskId = typeof task === 'number' ? task : task.id
  router.push(`/tasks/${taskId}`)
}

const editTask = (task: Task) => {
  ElMessage.info(`编辑任务: ${task.title}`)
  // TODO: 实现编辑功能
}

const deleteTask = (task: Task) => {
  ElMessageBox.confirm(`确定要删除任务 "${task.title}" 吗？删除后数据将无法恢复。`, '确认删除', {
    type: 'error',
    confirmButtonText: '删除',
  }).then(() => {
    tasks.value = tasks.value.filter((t) => t.id !== task.id)
    ElMessage.success('任务已删除')
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
        const newTask: Task = {
          id: tasks.value.length + 1,
          title: createForm.value.title,
          description: createForm.value.description,
          project_id: createForm.value.project_id,
          assignee_id: createForm.value.assignee_id,
          reporter_id: 1, // 当前用户ID
          status: 'todo',
          priority: createForm.value.priority as any,
          type: createForm.value.type as any,
          estimate_hours: createForm.value.estimate_hours,
          due_date: createForm.value.due_date,
          tags: createForm.value.tags,
          created_at: new Date().toISOString(),
          assignee: availableUsers.value.find((u) => u.id === createForm.value.assignee_id),
          reporter: availableUsers.value.find((u) => u.id === 1),
          project: availableProjects.value.find((p) => p.id === createForm.value.project_id),
        }

        tasks.value.unshift(newTask)
        creating.value = false
        showCreateDialog.value = false
        createFormRef.value?.resetFields()
        ElMessage.success('任务创建成功')
      }, 1000)
    }
  })
}

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}

const tableRowClassName = ({ row }: { row: Task }) => {
  if (row.status === 'done') {
    return 'task-row-done'
  } else if (row.due_date && new Date(row.due_date) < new Date()) {
    return 'task-row-overdue'
  }
  return ''
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 // 禁用今天之前的日期
}

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    todo: 'info',
    in_progress: 'warning',
    review: 'primary',
    done: 'success',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    todo: '待处理',
    in_progress: '进行中',
    review: '审核中',
    done: '已完成',
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
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const isDeadlineNear = (dateString?: string) => {
  if (!dateString) return false
  const dueDate = new Date(dateString)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 && diffDays <= 3
}

onMounted(() => {
  // 可以在这里加载任务数据
})
</script>

<style scoped>
.task-list-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.task-header {
  margin-bottom: 24px;
}

.task-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.task-subtitle {
  color: var(--el-text-color-secondary);
  margin: 0 0 16px 0;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
}

.task-filters {
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

.task-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.task-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
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

.task-table-card {
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.task-title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-title-text {
  font-weight: 500;
  line-height: 1.4;
}

.task-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.task-tag {
  height: 20px;
  line-height: 18px;
}

.more-tags {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}

.assignee-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assignee-name {
  font-size: 14px;
}

.no-assignee,
.no-project {
  color: var(--el-text-color-secondary);
  font-style: italic;
}

.deadline-warning {
  color: var(--el-color-warning);
  font-weight: 600;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 表格行样式 */
:deep(.task-row-done) {
  opacity: 0.7;
  background-color: var(--el-fill-color-lighter);
}

:deep(.task-row-overdue) {
  background-color: rgba(245, 108, 108, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .task-filters {
    flex-direction: column;
  }

  .search-input {
    max-width: 100%;
  }

  .task-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .task-stats {
    grid-template-columns: 1fr;
  }
}
</style>
