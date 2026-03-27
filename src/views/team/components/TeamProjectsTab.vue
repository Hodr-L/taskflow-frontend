<template>
  <div class="team-projects-tab">
    <!-- 椤圭洰澶撮儴 -->
    <div class="projects-header">
      <div class="header-left">
        <h3>鍥㈤槦椤圭洰</h3>
        <p class="project-count">鍏?{{ projects.length }} 涓」鐩?/p>
      </div>

      <div class="header-right" v-if="userRole === 'owner' || userRole === 'admin'">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          鏂板缓椤圭洰
        </el-button>
      </div>
    </div>

    <!-- 椤圭洰缁熻 -->
    <div class="project-stats">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ totalTasks }}</div>
            <div class="stat-label">鎬讳换鍔℃暟</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ completedTasks }}</div>
            <div class="stat-label">宸插畬鎴?/div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ activeProjects }}</div>
            <div class="stat-label">杩涜涓?/div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ averageProgress }}%</div>
            <div class="stat-label">骞冲潎杩涘害</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 椤圭洰鍒楄〃 -->
    <div class="projects-list">
      <div v-if="projects.length === 0" class="empty-projects">
        <el-empty description="鏆傛棤椤圭洰">
          <el-button type="primary" @click="showCreateDialog = true"> 鍒涘缓绗竴涓」鐩?</el-button>
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
                  <el-dropdown-item command="edit">缂栬緫椤圭洰</el-dropdown-item>
                  <el-dropdown-item command="tasks">鏌ョ湅浠诲姟</el-dropdown-item>
                  <el-dropdown-item command="members">绠＄悊鎴愬憳</el-dropdown-item>
                  <el-dropdown-item divided command="archive" v-if="project.status === 'active'"
                    >褰掓。椤圭洰</el-dropdown-item
                  >
                  <el-dropdown-item command="activate" v-if="project.status === 'archived'"
                    >婵€娲婚」鐩?/el-dropdown-item
                  >
                  <el-dropdown-item command="delete">鍒犻櫎椤圭洰</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div class="project-progress">
            <div class="progress-info">
              <span class="progress-label">椤圭洰杩涘害</span>
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
              <span>{{ project.task_count }} 涓换鍔?/span>
            </div>
            <div class="stat-item">
              <el-icon><Check /></el-icon>
              <span>{{ project.completed_tasks }} 宸插畬鎴?/span>
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

    <!-- 鍒涘缓椤圭洰瀵硅瘽妗?-->
    <el-dialog v-model="showCreateDialog" title="鏂板缓椤圭洰" width="500px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="椤圭洰鍚嶇О" prop="name">
          <el-input
            v-model="createForm.name"
            placeholder="璇疯緭鍏ラ」鐩悕绉?
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="椤圭洰鎻忚堪" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="璇疯緭鍏ラ」鐩弿杩?
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="寮€濮嬫棩鏈? prop="start_date">
          <el-date-picker
            v-model="createForm.start_date"
            type="date"
            placeholder="閫夋嫨寮€濮嬫棩鏈?
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="缁撴潫鏃ユ湡" prop="end_date">
          <el-date-picker
            v-model="createForm.end_date"
            type="date"
            placeholder="閫夋嫨缁撴潫鏃ユ湡"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledEndDate"
          />
        </el-form-item>

        <el-form-item label="椤圭洰鐘舵€? prop="status">
          <el-radio-group v-model="createForm.status">
            <el-radio label="active">杩涜涓?/el-radio>
            <el-radio label="planning">瑙勫垝涓?/el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">鍙栨秷</el-button>
          <el-button type="primary" :loading="creating" @click="handleCreateProject">
            鍒涘缓椤圭洰
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
import { Plus, More, List, Check, Calendar, Clock } from '@element-plus/icons-vue'

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

// 鐘舵€?const showCreateDialog = ref(false)
const creating = ref(false)

// 鍒涘缓琛ㄥ崟
const createForm = reactive({
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'active',
})

const createRules = {
  name: [
    { required: true, message: '璇疯緭鍏ラ」鐩悕绉?, trigger: 'blur' },
    { min: 2, max: 100, message: '椤圭洰鍚嶇О闀垮害鍦?鍒?00涓瓧绗︿箣闂?, trigger: 'blur' },
  ],
  description: [
    { required: true, message: '璇疯緭鍏ラ」鐩弿杩?, trigger: 'blur' },
    { max: 500, message: '椤圭洰鎻忚堪涓嶈兘瓒呰繃500涓瓧绗?, trigger: 'blur' },
  ],
  start_date: [{ required: true, message: '璇烽€夋嫨寮€濮嬫棩鏈?, trigger: 'change' }],
  end_date: [{ required: true, message: '璇烽€夋嫨缁撴潫鏃ユ湡', trigger: 'change' }],
}

// 璁＄畻灞炴€?const totalTasks = computed(() => {
  return props.projects.reduce((sum, project) => sum + project.task_count, 0)
})

const completedTasks = computed(() => {
  return props.projects.reduce((sum, project) => sum + project.completed_tasks, 0)
})

const activeProjects = computed(() => {
  return props.projects.filter((project) => project.status === 'active').length
})

const averageProgress = computed(() => {
  if (props.projects.length === 0) return 0
  const totalProgress = props.projects.reduce((sum, project) => sum + project.progress, 0)
  return Math.round(totalProgress / props.projects.length)
})

// 鑾峰彇杩涘害鏉￠鑹?const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#67c23a'
  if (progress >= 50) return '#e6a23c'
  return '#f56c6c'
}

// 鑾峰彇鐘舵€佺被鍨?const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'planning':
      return 'info'
    case 'archived':
      return 'warning'
    default:
      return 'default'
  }
}

// 鑾峰彇鐘舵€佹枃鏈?const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '杩涜涓?
    case 'planning':
      return '瑙勫垝涓?
    case 'archived':
      return '宸插綊妗?
    default:
      return status
  }
}

// 鏍煎紡鍖栨棩鏈?const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 绂佺敤缁撴潫鏃ユ湡锛堜笉鑳芥棭浜庡紑濮嬫棩鏈燂級
const disabledEndDate = (time: Date) => {
  if (!createForm.start_date) return false
  const startDate = new Date(createForm.start_date)
  return time.getTime() < startDate.getTime()
}

// 鏌ョ湅椤圭洰
const viewProject = (projectId: number) => {
  router.push(`/projects/${projectId}`)
}

// 澶勭悊椤圭洰鍛戒护
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

// 缂栬緫椤圭洰
const editProject = (project: Project) => {
  ElMessage.info(`缂栬緫椤圭洰: ${project.name}`)
  // TODO: 鎵撳紑缂栬緫瀵硅瘽妗?}

// 鏌ョ湅椤圭洰浠诲姟
const viewProjectTasks = (projectId: number) => {
  router.push(`/projects/${projectId}?tab=tasks`)
}

// 绠＄悊椤圭洰鎴愬憳
const manageProjectMembers = (projectId: number) => {
  ElMessage.info(`绠＄悊椤圭洰 ${projectId} 鐨勬垚鍛榒)
  // TODO: 鎵撳紑鎴愬憳绠＄悊瀵硅瘽妗?}

// 褰掓。椤圭洰
const archiveProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm(
      `纭畾瑕佸綊妗ｉ」鐩?"${project.name}" 鍚楋紵褰掓。鍚庨」鐩皢涓嶅啀鏄剧ず鍦ㄦ椿璺冮」鐩腑銆俙,
      '纭褰掓。',
      {
        confirmButtonText: '纭畾褰掓。',
        cancelButtonText: '鍙栨秷',
        type: 'warning',
      },
    )

    // TODO: 璋冪敤API褰掓。椤圭洰
    await new Promise((resolve) => setTimeout(resolve, 1000))

    project.status = 'archived'
    ElMessage.success('椤圭洰宸插綊妗?)
  } catch {
    // 鐢ㄦ埛鍙栨秷
  }
}

// 婵€娲婚」鐩?const activateProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm(`纭畾瑕佹縺娲婚」鐩?"${project.name}" 鍚楋紵`, '纭婵€娲?, {
      confirmButtonText: '纭畾婵€娲?,
      cancelButtonText: '鍙栨秷',
      type: 'info',
    })

    // TODO: 璋冪敤API婵€娲婚」鐩?    await new Promise((resolve) => setTimeout(resolve, 1000))

    project.status = 'active'
    ElMessage.success('椤圭洰宸叉縺娲?)
  } catch {
    // 鐢ㄦ埛鍙栨秷
  }
}

// 鍒犻櫎椤圭洰
const deleteProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm(
      `纭畾瑕佸垹闄ら」鐩?"${project.name}" 鍚楋紵姝ゆ搷浣滃皢鍒犻櫎椤圭洰鎵€鏈夋暟鎹笖涓嶅彲鎭㈠銆俙,
      '纭鍒犻櫎',
      {
        confirmButtonText: '纭畾鍒犻櫎',
        cancelButtonText: '鍙栨秷',
        type: 'error',
      },
    )

    // TODO: 璋冪敤API鍒犻櫎椤圭洰
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const projectIndex = props.projects.findIndex((p) => p.id === project.id)
    if (projectIndex !== -1) {
      props.projects.splice(projectIndex, 1)
    }

    ElMessage.success('椤圭洰鍒犻櫎鎴愬姛')
  } catch {
    // 鐢ㄦ埛鍙栨秷
  }
}

// 鍒涘缓椤圭洰
const handleCreateProject = async () => {
  creating.value = true

  try {
    // TODO: 璋冪敤API鍒涘缓椤圭洰
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newProject: Project = {
      id: props.projects.length + 1,
      name: createForm.name,
      description: createForm.description,
      status: createForm.status,
      task_count: 0,
      completed_tasks: 0,
      progress: 0,
      start_date: createForm.start_date,
      end_date: createForm.end_date,
    }

    props.projects.unshift(newProject)
    ElMessage.success('椤圭洰鍒涘缓鎴愬姛')
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

/* 椤圭洰缁熻 */
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

/* 椤圭洰缃戞牸 */
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

/* 椤圭洰杩涘害 */
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

/* 椤圭洰缁熻 */
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

/* 椤圭洰椤佃剼 */
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

/* 绌虹姸鎬?*/
.empty-projects {
  padding: 60px 0;
  text-align: center;
}

/* 鍝嶅簲寮忚璁?*/
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
