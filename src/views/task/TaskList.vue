<template>
  <div class="task-list-container">
    <div class="task-header">
      <h2 class="task-title">浠诲姟绠＄悊</h2>
      <p class="task-subtitle">鍒涘缓銆佸垎閰嶅拰璺熻釜浠诲姟杩涘害</p>

      <div class="task-actions">
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          鍒涘缓浠诲姟
        </el-button>
      </div>
    </div>

    <!-- 杩囨护鍜屾悳绱?-->
    <div class="task-filters">
      <el-input
        v-model="searchText"
        placeholder="鎼滅储浠诲姟鏍囬鎴栨弿杩?
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
        placeholder="鐘舵€?
        clearable
        @change="handleFilter"
        multiple
      >
        <el-option label="寰呭鐞? value="todo" />
        <el-option label="杩涜涓? value="in_progress" />
        <el-option label="瀹℃牳涓? value="review" />
        <el-option label="宸插畬鎴? value="done" />
      </el-select>

      <el-select
        v-model="filterPriority"
        placeholder="浼樺厛绾?
        clearable
        @change="handleFilter"
        multiple
      >
        <el-option label="浣? value="low" />
        <el-option label="涓? value="medium" />
        <el-option label="楂? value="high" />
        <el-option label="绱ф€? value="urgent" />
      </el-select>

      <el-select v-model="filterAssignee" placeholder="璐熻矗浜? clearable @change="handleFilter">
        <el-option
          v-for="user in availableUsers"
          :key="user.id"
          :label="user.full_name || user.username"
          :value="user.id"
        />
      </el-select>

      <el-select v-model="filterProject" placeholder="椤圭洰" clearable @change="handleFilter">
        <el-option
          v-for="project in availableProjects"
          :key="project.id"
          :label="project.name"
          :value="project.id"
        />
      </el-select>
    </div>

    <!-- 浠诲姟鍒楄〃 -->
    <div class="task-content">
      <!-- 浠诲姟缁熻鍗＄墖 -->
      <div class="task-stats">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-number">{{ taskStatistics.total_tasks || 0 }}</span>
            <span class="stat-label">鎬讳换鍔℃暟</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-number" style="color: #e6a23c">{{
              taskStatistics.todo_tasks || 0
            }}</span>
            <span class="stat-label">寰呭鐞?/span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-number" style="color: #1989fa">{{
              taskStatistics.in_progress_tasks || 0
            }}</span>
            <span class="stat-label">杩涜涓?/span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-number" style="color: #67c23a">{{
              taskStatistics.done_tasks || 0
            }}</span>
            <span class="stat-label">宸插畬鎴?/span>
          </div>
        </el-card>
      </div>

      <!-- 浠诲姟琛ㄦ牸 -->
      <el-card class="task-table-card">
        <template #header>
          <div class="table-header">
            <span class="table-title">浠诲姟鍒楄〃</span>
            <div class="table-actions">
              <el-button :icon="Refresh" @click="refreshTasks">鍒锋柊</el-button>
              <el-dropdown @command="handleTableCommand">
                <el-button :icon="Setting">瑙嗗浘</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="compact">绱у噾瑙嗗浘</el-dropdown-item>
                    <el-dropdown-item command="normal">鏍囧噯瑙嗗浘</el-dropdown-item>
                    <el-dropdown-item divided command="export">瀵煎嚭CSV</el-dropdown-item>
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
          <el-table-column label="鏍囬" min-width="200">
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
          <el-table-column label="鐘舵€? width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small" effect="light">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="浼樺厛绾? width="120">
            <template #default="{ row }">
              <el-tag :type="getPriorityTagType(row.priority)" size="small" effect="light">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="璐熻矗浜? width="150">
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
              <span v-else class="no-assignee">鏈垎閰?/span>
            </template>
          </el-table-column>
          <el-table-column label="椤圭洰" width="150">
            <template #default="{ row }">
              <span v-if="row.project">{{ row.project.name }}</span>
              <span v-else class="no-project">鏃犻」鐩?/span>
            </template>
          </el-table-column>
          <el-table-column label="鎴鏃ユ湡" width="120">
            <template #default="{ row }">
              <span :class="{ 'deadline-warning': isDeadlineNear(row.due_date) }">
                {{ formatDate(row.due_date) || '鏃? }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="鎿嶄綔" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click.stop="viewTask(row.id)"
                >鏌ョ湅</el-button
              >
              <el-button type="info" link size="small" @click.stop="editTask(row)">缂栬緫</el-button>
              <el-button type="danger" link size="small" @click.stop="deleteTask(row)"
                >鍒犻櫎</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 鍒嗛〉 -->
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

    <!-- 鍒涘缓浠诲姟瀵硅瘽妗?-->
    <el-dialog
      v-model="showCreateDialog"
      title="鍒涘缓浠诲姟"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="浠诲姟鏍囬" prop="title">
          <el-input
            v-model="createForm.title"
            placeholder="璇疯緭鍏ヤ换鍔℃爣棰?
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="浠诲姟鎻忚堪" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="璇疯緭鍏ヤ换鍔℃弿杩?
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="浼樺厛绾? prop="priority">
              <el-select
                v-model="createForm.priority"
                placeholder="璇烽€夋嫨浼樺厛绾?
                style="width: 100%"
              >
                <el-option label="浣? value="low" />
                <el-option label="涓? value="medium" />
                <el-option label="楂? value="high" />
                <el-option label="绱ф€? value="urgent" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="浠诲姟绫诲瀷" prop="type">
              <el-select v-model="createForm.type" placeholder="璇烽€夋嫨绫诲瀷" style="width: 100%">
                <el-option label="鍔熻兘" value="feature" />
                <el-option label="缂洪櫡" value="bug" />
                <el-option label="鏀硅繘" value="improvement" />
                <el-option label="鏂囨。" value="documentation" />
                <el-option label="鍏朵粬" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="璐熻矗浜? prop="assignee_id">
              <el-select
                v-model="createForm.assignee_id"
                placeholder="璇烽€夋嫨璐熻矗浜?
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
            <el-form-item label="椤圭洰" prop="project_id">
              <el-select
                v-model="createForm.project_id"
                placeholder="璇烽€夋嫨椤圭洰"
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
            <el-form-item label="棰勮宸ユ椂" prop="estimate_hours">
              <el-input-number
                v-model="createForm.estimate_hours"
                :min="0"
                :step="0.5"
                style="width: 100%"
                placeholder="璇疯緭鍏ラ璁″伐鏃?
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="鎴鏃ユ湡" prop="due_date">
              <el-date-picker
                v-model="createForm.due_date"
                type="date"
                placeholder="閫夋嫨鎴鏃ユ湡"
                style="width: 100%"
                :disabled-date="disabledDate"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="鏍囩" prop="tags">
          <el-select
            v-model="createForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="璇锋坊鍔犱换鍔℃爣绛?
            style="width: 100%"
          >
            <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
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
import { Plus, Search, Refresh, Setting } from '@element-plus/icons-vue'
import type { Task, TaskStatistics } from '@/types/task'
import type { Project } from '@/types/project'
import type { User as UserType } from '@/types/user'

const router = useRouter()

// 鍝嶅簲寮忔暟鎹?const tasks = ref<Task[]>([
  {
    id: 1,
    title: '璁捐鐧诲綍椤甸潰',
    description: '瀹屾垚鐧诲綍椤甸潰鐨刄I璁捐锛屽寘鎷搷搴斿紡甯冨眬',
    project_id: 1,
    assignee_id: 1,
    reporter_id: 2,
    status: 'in_progress',
    priority: 'high',
    type: 'feature',
    estimate_hours: 8,
    actual_hours: 4,
    due_date: '2026-03-25',
    tags: ['鍓嶇', 'UI', '璁捐'],
    created_at: '2026-03-20T10:00:00Z',
    assignee: {
      id: 1,
      username: 'designer',
      fullname: '璁捐甯?,
      bio: 'UI/UX璁捐甯?,
      avatar_url: 'https://via.placeholder.com/50',
    },
    reporter: {
      id: 2,
      username: 'pm',
      fullname: '浜у搧缁忕悊',
      bio: '浜у搧缁忕悊',
    },
    project: {
      id: 1,
      name: '缃戠珯閲嶆瀯椤圭洰',
    },
  },
  {
    id: 2,
    title: '淇娉ㄥ唽椤甸潰楠岃瘉閿欒',
    description: '瑙ｅ喅娉ㄥ唽琛ㄥ崟鐨勯偖绠遍獙璇侀€昏緫闂',
    project_id: 1,
    assignee_id: 3,
    reporter_id: 2,
    status: 'todo',
    priority: 'urgent',
    type: 'bug',
    estimate_hours: 4,
    due_date: '2026-03-22',
    tags: ['鍚庣', '楠岃瘉', '淇'],
    created_at: '2026-03-20T09:30:00Z',
    assignee: {
      id: 3,
      username: 'developer',
      fullname: '寮€鍙戝伐绋嬪笀',
      bio: '鍚庣寮€鍙戝伐绋嬪笀',
    },
    reporter: {
      id: 2,
      username: 'pm',
      fullname: '浜у搧缁忕悊',
      bio: '浜у搧缁忕悊',
    },
    project: {
      id: 1,
      name: '缃戠珯閲嶆瀯椤圭洰',
    },
  },
  {
    id: 3,
    title: '缂栧啓API鏂囨。',
    description: '涓虹敤鎴疯璇丄PI缂栧啓璇︾粏鐨勪娇鐢ㄦ枃妗?,
    project_id: 2,
    assignee_id: 4,
    reporter_id: 1,
    status: 'review',
    priority: 'medium',
    type: 'documentation',
    estimate_hours: 12,
    actual_hours: 10,
    due_date: '2026-03-28',
    tags: ['鏂囨。', 'API'],
    created_at: '2026-03-19T14:20:00Z',
    assignee: {
      id: 4,
      username: 'techwriter',
      fullname: '鎶€鏈枃妗ｅ伐绋嬪笀',
    },
    reporter: {
      id: 1,
      username: 'designer',
      fullname: '璁捐甯?,
    },
    project: {
      id: 2,
      name: '绉诲姩搴旂敤寮€鍙?,
    },
  },
  {
    id: 4,
    title: '鏁版嵁搴撴€ц兘浼樺寲',
    description: '浼樺寲鐢ㄦ埛鏌ヨ鐨勬暟鎹簱绱㈠紩',
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
    tags: ['鏁版嵁搴?, '浼樺寲', '鎬ц兘'],
    created_at: '2026-03-15T11:10:00Z',
    assignee: {
      id: 5,
      username: 'dba',
      fullname: '鏁版嵁搴撶鐞嗗憳',
      bio: '鏁版嵁搴撶鐞嗗憳',
    },
    reporter: {
      id: 2,
      username: 'pm',
      fullname: '浜у搧缁忕悊',
      bio: '浜у搧缁忕悊',
    },
    project: {
      id: 1,
      name: '缃戠珯閲嶆瀯椤圭洰',
    },
  },
])

const availableUsers = ref<UserType[]>([
  {
    id: 1,
    username: 'designer',
    fullname: '璁捐甯?,
    bio: 'UI/UX璁捐甯?,
    email: 'designer@example.com',
    role: 'designer',
  },
  { id: 2, username: 'pm', fullname: '浜у搧缁忕悊', bio: '浜у搧缁忕悊', email: 'pm@example.com', role: 'pm' },
  {
    id: 3,
    username: 'developer',
    fullname: '寮€鍙戝伐绋嬪笀',
    bio: '鍚庣寮€鍙戝伐绋嬪笀',
    email: 'developer@example.com',
    role: 'developer',
  },
  {
    id: 4,
    username: 'techwriter',
    fullname: '鎶€鏈枃妗ｅ伐绋嬪笀',
    bio: '鎶€鏈枃妗ｅ伐绋嬪笀',
    email: 'writer@example.com',
    role: 'writer',
  },
  { id: 5, username: 'dba', fullname: '鏁版嵁搴撶鐞嗗憳', bio: '鏁版嵁搴撶鐞嗗憳', email: 'dba@example.com', role: 'dba' },
])

const availableProjects = ref<Project[]>([
  {
    id: 1,
    name: '缃戠珯閲嶆瀯椤圭洰',
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
    name: '绉诲姩搴旂敤寮€鍙?,
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
    name: '鏁版嵁杩佺Щ椤圭洰',
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
  '鍓嶇',
  '鍚庣',
  'UI',
  '璁捐',
  '鏁版嵁搴?,
  'API',
  '鏂囨。',
  '娴嬭瘯',
  '浼樺寲',
  '鎬ц兘',
  '瀹夊叏',
  '閮ㄧ讲',
  '绉诲姩绔?,
  'Web绔?,
  'Bug',
  '鍔熻兘',
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
    { required: true, message: '璇疯緭鍏ヤ换鍔℃爣棰?, trigger: 'blur' },
    { min: 2, max: 100, message: '闀垮害鍦?2 鍒?100 涓瓧绗?, trigger: 'blur' },
  ],
  priority: [{ required: true, message: '璇烽€夋嫨浼樺厛绾?, trigger: 'change' }],
}

// 璁＄畻灞炴€?const filteredTasks = computed(() => {
  let result = tasks.value

  // 鎼滅储杩囨护
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(
      (task) =>
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search),
    )
  }

  // 鐘舵€佽繃婊?  if (filterStatus.value.length > 0) {
    result = result.filter((task) => filterStatus.value.includes(task.status))
  }

  // 浼樺厛绾ц繃婊?  if (filterPriority.value.length > 0) {
    result = result.filter((task) => filterPriority.value.includes(task.priority))
  }

  // 璐熻矗浜鸿繃婊?  if (filterAssignee.value) {
    result = result.filter((task) => task.assignee_id === filterAssignee.value)
  }

  // 椤圭洰杩囨护
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

  // 璁＄畻閫炬湡浠诲姟
  const today = new Date()
  const overdue = tasks.value.filter((task) => {
    if (!task.due_date || task.status === 'done') return false
    const dueDate = new Date(task.due_date)
    return dueDate < today
  }).length

  // 璁＄畻鎬婚浼板拰瀹為檯宸ユ椂
  const totalEstimate = tasks.value.reduce((sum, task) => sum + (task.estimate_hours || 0), 0)
  const totalActual = tasks.value.reduce((sum, task) => sum + (task.actual_hours || 0), 0)

  // 璁＄畻瀹屾垚鐜?  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

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

// 鏂规硶
const handleSearch = () => {
  // 鎼滅储閫昏緫宸查€氳繃璁＄畻灞炴€у疄鐜?  currentPage.value = 1 // 閲嶇疆鍒扮涓€椤?}

const handleFilter = () => {
  currentPage.value = 1 // 閲嶇疆鍒扮涓€椤?}

const refreshTasks = () => {
  ElMessage.success('浠诲姟鍒楄〃宸插埛鏂?)
  // 杩欓噷搴旇璋冪敤API閲嶆柊鍔犺浇浠诲姟
}

const handleTableCommand = (command: string) => {
  switch (command) {
    case 'compact':
      ElMessage.info('鍒囨崲涓虹揣鍑戣鍥?)
      break
    case 'normal':
      ElMessage.info('鍒囨崲涓烘爣鍑嗚鍥?)
      break
    case 'export':
      exportTasks()
      break
  }
}

const exportTasks = () => {
  ElMessage.info('瀵煎嚭鍔熻兘寮€鍙戜腑...')
}

const viewTask = (task: Task | number) => {
  const taskId = typeof task === 'number' ? task : task.id
  router.push(`/tasks/${taskId}`)
}

const editTask = (task: Task) => {
  ElMessage.info(`缂栬緫浠诲姟: ${task.title}`)
  // TODO: 瀹炵幇缂栬緫鍔熻兘
}

const deleteTask = (task: Task) => {
  ElMessageBox.confirm(`纭畾瑕佸垹闄や换鍔?"${task.title}" 鍚楋紵鍒犻櫎鍚庢暟鎹皢鏃犳硶鎭㈠銆俙, '纭鍒犻櫎', {
    type: 'error',
    confirmButtonText: '鍒犻櫎',
  }).then(() => {
    tasks.value = tasks.value.filter((t) => t.id !== task.id)
    ElMessage.success('浠诲姟宸插垹闄?)
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
        const newTask: Task = {
          id: tasks.value.length + 1,
          title: createForm.value.title,
          description: createForm.value.description,
          project_id: createForm.value.project_id,
          assignee_id: createForm.value.assignee_id,
          reporter_id: 1, // 褰撳墠鐢ㄦ埛ID
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
        ElMessage.success('浠诲姟鍒涘缓鎴愬姛')
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
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000 // 绂佺敤浠婂ぉ涔嬪墠鐨勬棩鏈?}

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
    todo: '寰呭鐞?,
    in_progress: '杩涜涓?,
    review: '瀹℃牳涓?,
    done: '宸插畬鎴?,
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
  // 鍙互鍦ㄨ繖閲屽姞杞戒换鍔℃暟鎹?})
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

/* 琛ㄦ牸琛屾牱寮?*/
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
