<template>
  <div class="team-projects-tab">
    <!-- 项目头部 -->
    <div class="projects-header">
      <div class="header-left">
        <h3>团队项目</h3>
        <p class="project-count">共 {{ projects.length }} 个项目</p>
      </div>
      
      <div class="header-right" v-if="userRole === 'owner' || userRole === 'admin'">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
      </div>
    </div>

    <!-- 项目统计 -->
    <div class="project-stats">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ totalTasks }}</div>
            <div class="stat-label">总任务数</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ completedTasks }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ activeProjects }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ averageProgress }}%</div>
            <div class="stat-label">平均进度</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 项目列表 -->
    <div class="projects-list">
      <div v-if="projects.length === 0" class="empty-projects">
        <el-empty description="暂无项目">
          <el-button type="primary" @click="showCreateDialog = true">
            创建第一个项目
          </el-button>
        </el-empty>
      </div>

      <div v-else class="project-grid">
        <div
          v-for="project in projects"
          :key="project.id"
          class="project-card"
          @click="viewProject(project.id)"
        >
          <div class="project-card-header">
            <div class="project-info">
              <h4 class="project-name">{{ project.name }}</h4>
              <p class="project-description">{{ project.description }}</p>
            </div>
            <el-dropdown @command="(command: string) => handleProjectCommand(command, project)">
              <el-icon class="project-menu"><More /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑项目</el-dropdown-item>
                  <el-dropdown-item command="tasks">查看任务</el-dropdown-item>
                  <el-dropdown-item command="members">管理成员</el-dropdown-item>
                  <el-dropdown-item divided command="archive" v-if="project.status === 'active'">归档项目</el-dropdown-item>
                  <el-dropdown-item command="activate" v-if="project.status === 'archived'">激活项目</el-dropdown-item>
                  <el-dropdown-item command="delete">删除项目</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div class="project-progress">
            <div class="progress-info">
              <span class="progress-label">项目进度</span>
              <span class="progress-value">{{ project.progress }}%</span>
            </div>
            <el-progress 
              :percentage="project.progress" 
              :stroke-width="6"
              :color="getProgressColor(project.progress)"
            />
          </div>

          <div class="project-stats">
            <div class="stat-item">
              <el-icon><List /></el-icon>
              <span>{{ project.task_count }} 个任务</span>
            </div>
            <div class="stat-item">
              <el-icon><Check /></el-icon>
              <span>{{ project.completed_tasks }} 已完成</span>
            </div>
          </div>

          <div class="project-footer">
            <div class="project-status">
              <el-tag :type="getStatusType(project.status)" size="small">
                {{ getStatusText(project.status) }}
              </el-tag>
            </div>
            <div class="project-dates">
              <span class="date-item">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(project.start_date) }}
              </span>
              <span class="date-item">
                <el-icon><Clock /></el-icon>
                {{ formatDate(project.end_date) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建项目对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建项目"
      width="500px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="80px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input
            v-model="createForm.name"
            placeholder="请输入项目名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="开始日期" prop="start_date">
          <el-date-picker
            v-model="createForm.start_date"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="结束日期" prop="end_date">
          <el-date-picker
            v-model="createForm.end_date"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledEndDate"
          />
        </el-form-item>

        <el-form-item label="项目状态" prop="status">
          <el-radio-group v-model="createForm.status">
            <el-radio label="active">进行中</el-radio>
            <el-radio label="planning">规划中</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="creating"
            @click="handleCreateProject"
          >
            创建项目
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  More, 
  List, 
  Check, 
  Calendar, 
  Clock 
} from '@element-plus/icons-vue'

interface Project {
  id: number
  name: string
  description: string
  status: string
  task_count: number
  completed_tasks: number
  progress: number
  start_date: string
  end_date: string
}

interface Props {
  teamId: number
  projects: Project[]
  userRole: string
}

const props = defineProps<Props>()
const router = useRouter()

// 状态
const showCreateDialog = ref(false)
const creating = ref(false)

// 创建表单
const createForm = reactive({
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'active'
})

const createRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 100, message: '项目名称长度在2到100个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { max: 500, message: '项目描述不能超过500个字符', trigger: 'blur' }
  ],
  start_date: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  end_date: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ]
}

// 计算属性
const totalTasks = computed(() => {
  return props.projects.reduce((sum, project) => sum + project.task_count, 0)
})

const completedTasks = computed(() => {
  return props.projects.reduce((sum, project) => sum + project.completed_tasks, 0)
})

const activeProjects = computed(() => {
  return props.projects.filter(project => project.status === 'active').length
})

const averageProgress = computed(() => {
  if (props.projects.length === 0) return 0
  const totalProgress = props.projects.reduce((sum, project) => sum + project.progress, 0)
  return Math.round(totalProgress / props.projects.length)
})

// 获取进度条颜色
const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#67c23a'
  if (progress >= 50) return '#e6a23c'
  return '#f56c6c'
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'planning': return 'info'
    case 'archived': return 'warning'
    default: return 'default'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '进行中'
    case 'planning': return '规划中'
    case 'archived': return '已归档'
    default: return status
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 禁用结束日期（不能早于开始日期）
const disabledEndDate = (time: Date) => {
  if (!createForm.start_date) return false
  const startDate = new Date(createForm.start_date)
  return time.getTime() < startDate.getTime()
}

// 查看项目
const viewProject = (projectId: number) => {
  router.push(`/projects/${projectId}`)
}

// 处理项目命令
const handleProjectCommand = (command: string, project: Project) => {
  switch (command) {
    case 'edit':
      editProject(project)
      break
    case 'tasks':
      viewProjectTasks(project.id)
      break
    case 'members':
      manageProjectMembers(project.id)
      break
    case 'archive':
      archiveProject(project)
      break
    case 'activate':
      activateProject(project)
      break
    case 'delete':
      deleteProject(project)
      break
  }
}

// 编辑项目
const editProject = (project: Project) => {
  ElMessage.info(`编辑项目: ${project.name}`)
  // TODO: 打开编辑对话框
}

// 查看项目任务
const viewProjectTasks = (projectId: number) => {
  router.push(`/projects/${projectId}?tab=tasks`)
}

// 管理项目成员
const manageProjectMembers = (projectId: number) => {
  ElMessage.info(`管理项目 ${projectId} 的成员`)
  // TODO: 打开成员管理对话框
}

// 归档项目
const archiveProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm(
      `确定要归档项目 "${project.name}" 吗？归档后项目将不再显示在活跃项目中。`,
      '确认归档',
      {
        confirmButtonText: '确定归档',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用API归档项目
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    project.status = 'archived'
    ElMessage.success('项目已归档')
  } catch {
    // 用户取消
  }
}

// 激活项目
const activateProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm(
      `确定要激活项目 "${project.name}" 吗？`,
      '确认激活',
      {
        confirmButtonText: '确定激活',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // TODO: 调用API激活项目
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    project.status = 'active'
    ElMessage.success('项目已激活')
  } catch {
    // 用户取消
  }
}

// 删除项目
const deleteProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.name}" 吗？此操作将删除项目所有数据且不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // TODO: 调用API删除项目
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const projectIndex = props.projects.findIndex(p => p.id === project.id)
    if (projectIndex !== -1) {
      props.projects.splice(projectIndex, 1)
    }
    
    ElMessage.success('项目删除成功')
  } catch {
    // 用户取消
  }
}

// 创建项目
const handleCreateProject = async () => {
  creating.value = true
  
  try {
    // TODO: 调用API创建项目
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newProject: Project = {
      id: props.projects.length + 1,
      name: createForm.name,
      description: createForm.description,
      status: createForm.status,
      task_count: 0,
      completed_tasks: 0,
      progress: 0,
      start_date: createForm.start_date,
      end_date: createForm.end_date
    }
    
    props.projects.unshift(newProject)
    ElMessage.success('项目创建成功')
    showCreateDialog.value = false
    resetCreateForm()
  } catch (error) {
    ElMessage.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

// 重置创建表单
const resetCreateForm = () => {
  createForm.name = ''
  createForm.description = ''
  createForm.start_date = ''
  createForm.end_date = ''
  createForm.status = 'active'
}
</script>

<style scoped>
.team-projects-tab {
  padding: 20px 0;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.project-count {
  font-size: 14px;
  color: #909399;
}

/* 项目统计 */
.project-stats {
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 项目网格 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #409eff;
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.project-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-menu {
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.project-menu:hover {
  color: #303133;
  background: #f5f7fa;
}

/* 项目进度 */
.project-progress {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  color: #606266;
}

.progress-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 项目统计 */
.project-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px 0;
  border-top: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.stat-item .el-icon {
  font-size: 16px;
  color: #409eff;
}

/* 项目页脚 */
.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-dates {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.date-item .el-icon {
  font-size: 12px;
}

/* 空状态 */
.empty-projects {
  padding: 60px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-grid {
    grid-template-columns: 1fr;
  }
  
  .project-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .project-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .project-dates {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .projects-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
  }
  
  .header-right .el-button {
    width: 100%;
  }
  
  .project-card {
    padding: 16px;
  }
  
  .project-name {
    font-size: 16px;
  }
  
  .project-description {
    font-size: 13px;
  }
}
</style>