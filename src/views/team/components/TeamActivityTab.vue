<template>
  <div class="team-activity-tab">
    <!-- 娲诲姩澶撮儴 -->
    <div class="activity-header">
      <h3>鍥㈤槦娲诲姩鏃ュ織</h3>
      <p class="activity-description">鏌ョ湅鍥㈤槦鐨勬墍鏈夋搷浣滆褰曞拰娲诲姩鍘嗗彶</p>
    </div>

    <!-- 娲诲姩绛涢€?-->
    <div class="activity-filter">
      <el-input v-model="searchKeyword" placeholder="鎼滅储娲诲姩鍐呭" class="search-input" clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterType" placeholder="绛涢€夋椿鍔ㄧ被鍨? class="type-filter" clearable>
        <el-option label="鍏ㄩ儴" value="" />
        <el-option label="鎴愬憳绠＄悊" value="member" />
        <el-option label="椤圭洰绠＄悊" value="project" />
        <el-option label="鍥㈤槦璁剧疆" value="team" />
        <el-option label="浠诲姟鎿嶄綔" value="task" />
      </el-select>

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="鑷?
        start-placeholder="寮€濮嬫棩鏈?
        end-placeholder="缁撴潫鏃ユ湡"
        class="date-filter"
      />
    </div>

    <!-- 娲诲姩鍒楄〃 -->
    <div class="activity-list">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in filteredActivities"
          :key="index"
          :timestamp="formatTime(activity.timestamp)"
          :type="getActivityType(activity.type)"
          placement="top"
        >
          <el-card class="activity-card" shadow="hover">
            <div class="activity-content">
              <div class="activity-icon">
                <el-avatar :size="36" :src="activity.user?.avatar_url">
                  {{ activity.user?.name?.substring(0, 1) || 'U' }}
                </el-avatar>
              </div>

              <div class="activity-details">
                <div class="activity-header">
                  <h4 class="activity-title">{{ activity.title }}</h4>
                  <el-tag :type="getActivityTagType(activity.type)" size="small">
                    {{ getActivityTypeLabel(activity.type) }}
                  </el-tag>
                </div>

                <p class="activity-description">
                  <span class="user-name">{{ activity.user?.name }}</span>
                  {{ activity.description }}
                </p>

                <div class="activity-meta" v-if="activity.details">
                  <div class="meta-item" v-if="activity.details.project_name">
                    <el-icon><Folder /></el-icon>
                    <span>{{ activity.details.project_name }}</span>
                  </div>

                  <div class="meta-item" v-if="activity.details.member_name">
                    <el-icon><User /></el-icon>
                    <span>{{ activity.details.member_name }}</span>
                  </div>

                  <div class="meta-item" v-if="activity.details.task_title">
                    <el-icon><Document /></el-icon>
                    <span>{{ activity.details.task_title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- 绌虹姸鎬?-->
      <div v-if="filteredActivities.length === 0" class="empty-activity">
        <el-empty description="鏆傛棤娲诲姩璁板綍" />
      </div>

      <!-- 鍔犺浇鏇村 -->
      <div class="load-more" v-if="hasMoreActivities">
        <el-button type="text" :loading="loadingMore" @click="loadMoreActivities">
          鍔犺浇鏇村娲诲姩璁板綍
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Folder, User, Document } from '@element-plus/icons-vue'

interface Props {
  teamId: number
}

interface Activity {
  id: number
  type: 'member' | 'project' | 'team' | 'task' | 'other'
  title: string
  description: string
  timestamp: string
  user: {
    id: number
    name: string
    avatar_url?: string
  }
  details?: {
    project_name?: string
    member_name?: string
    task_title?: string
    old_value?: string
    new_value?: string
  }
}

const props = defineProps<Props>()

// 鎼滅储鍜岀瓫閫?const searchKeyword = ref('')
const filterType = ref('')
const dateRange = ref<[Date, Date] | null>(null)

// 娲诲姩鏁版嵁
const activities = ref<Activity[]>([
  {
    id: 1,
    type: 'member',
    title: '鏂版垚鍛樺姞鍏?,
    description: '鍔犲叆浜嗗洟闃?,
    timestamp: '2026-03-19T14:30:00Z',
    user: {
      id: 3,
      name: '鐜嬩簲',
      avatar_url: '',
    },
    details: {
      member_name: '鐜嬩簲',
    },
  },
  {
    id: 2,
    type: 'project',
    title: '鍒涘缓鏂伴」鐩?,
    description: '鍒涘缓浜嗛」鐩?,
    timestamp: '2026-03-18T10:15:00Z',
    user: {
      id: 2,
      name: '鏉庡洓',
      avatar_url: '',
    },
    details: {
      project_name: '鐢ㄦ埛涓績閲嶆瀯',
    },
  },
  {
    id: 3,
    type: 'team',
    title: '鍥㈤槦淇℃伅鏇存柊',
    description: '鏇存柊浜嗗洟闃熸弿杩?,
    timestamp: '2026-03-17T16:45:00Z',
    user: {
      id: 1,
      name: '寮犱笁',
      avatar_url: '',
    },
    details: {
      old_value: '鍓嶇寮€鍙戝洟闃?,
      new_value: '璐熻矗鍓嶇鐣岄潰寮€鍙戝拰鐢ㄦ埛浣撻獙浼樺寲',
    },
  },
  {
    id: 4,
    type: 'task',
    title: '瀹屾垚浠诲姟',
    description: '瀹屾垚浜嗕换鍔?,
    timestamp: '2026-03-16T09:20:00Z',
    user: {
      id: 3,
      name: '鐜嬩簲',
      avatar_url: '',
    },
    details: {
      task_title: '璁捐鐢ㄦ埛涓績鐣岄潰',
      project_name: '鐢ㄦ埛涓績閲嶆瀯',
    },
  },
  {
    id: 5,
    type: 'member',
    title: '瑙掕壊鍙樻洿',
    description: '鐨勮鑹插彉鏇翠负绠＄悊鍛?,
    timestamp: '2026-03-15T14:10:00Z',
    user: {
      id: 2,
      name: '鏉庡洓',
      avatar_url: '',
    },
    details: {
      member_name: '鏉庡洓',
      old_value: '鎴愬憳',
      new_value: '绠＄悊鍛?,
    },
  },
  {
    id: 6,
    type: 'project',
    title: '椤圭洰鐘舵€佹洿鏂?,
    description: '鏇存柊浜嗛」鐩姸鎬?,
    timestamp: '2026-03-14T11:30:00Z',
    user: {
      id: 1,
      name: '寮犱笁',
      avatar_url: '',
    },
    details: {
      project_name: 'TaskFlow 鍓嶇寮€鍙?,
      old_value: '杩涜涓?,
      new_value: '宸插畬鎴?,
    },
  },
])

// 鍒嗛〉
const pageSize = 10
const currentPage = ref(1)
const loadingMore = ref(false)
const hasMoreActivities = ref(true)

// 璁＄畻灞炴€э細绛涢€夊悗鐨勬椿鍔?const filteredActivities = computed(() => {
  let filtered = activities.value

  // 鎸夌被鍨嬬瓫閫?  if (filterType.value) {
    filtered = filtered.filter((activity) => activity.type === filterType.value)
  }

  // 鎸夋悳绱㈠叧閿瘝绛涢€?  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(
      (activity) =>
        activity.title.toLowerCase().includes(keyword) ||
        activity.description.toLowerCase().includes(keyword) ||
        activity.user.name.toLowerCase().includes(keyword),
    )
  }

  // 鎸夋棩鏈熻寖鍥寸瓫閫?  if (dateRange.value) {
    const [start, end] = dateRange.value
    filtered = filtered.filter((activity) => {
      const activityDate = new Date(activity.timestamp)
      return activityDate >= start && activityDate <= end
    })
  }

  // 鍒嗛〉
  return filtered.slice(0, pageSize * currentPage.value)
})

// 鐢熷懡鍛ㄦ湡
onMounted(() => {
  loadActivities()
})

// 鍔犺浇娲诲姩鏁版嵁
const loadActivities = async () => {
  try {
    // TODO: 璋冪敤API鑾峰彇娲诲姩鏁版嵁
    console.log('鍔犺浇鍥㈤槦娲诲姩鏁版嵁锛屽洟闃烮D:', props.teamId)
  } catch (error) {
    console.error('鍔犺浇娲诲姩鏁版嵁澶辫触:', error)
  }
}

// 鍔犺浇鏇村娲诲姩
const loadMoreActivities = async () => {
  loadingMore.value = true

  try {
    // TODO: 璋冪敤API鍔犺浇鏇村娲诲姩鏁版嵁
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 妯℃嫙娣诲姞鏇村鏁版嵁
    const newActivities: Activity[] = [
      {
        id: activities.value.length + 1,
        type: 'task',
        title: '鍒涘缓鏂颁换鍔?,
        description: '鍒涘缓浜嗕换鍔?,
        timestamp: '2026-03-13T09:00:00Z',
        user: {
          id: 3,
          name: '鐜嬩簲',
          avatar_url: '',
        },
        details: {
          task_title: '浼樺寲椤甸潰鍔犺浇鎬ц兘',
          project_name: 'TaskFlow 鍓嶇寮€鍙?,
        },
      },
      {
        id: activities.value.length + 2,
        type: 'member',
        title: '鎴愬憳绂诲紑',
        description: '绂诲紑浜嗗洟闃?,
        timestamp: '2026-03-12T16:30:00Z',
        user: {
          id: 4,
          name: '璧靛叚',
          avatar_url: '',
        },
        details: {
          member_name: '璧靛叚',
        },
      },
    ]

    activities.value.push(...newActivities)
    currentPage.value += 1

    // 妫€鏌ユ槸鍚﹁繕鏈夋洿澶氭暟鎹?    hasMoreActivities.value = activities.value.length < 50 // 鍋囪鎬诲叡鏈?0鏉℃暟鎹?  } catch (error) {
    console.error('鍔犺浇鏇村娲诲姩澶辫触:', error)
  } finally {
    loadingMore.value = false
  }
}

// 鏍煎紡鍖栨椂闂?const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  // 濡傛灉鏄粖澶?  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 濡傛灉鏄槰澶?  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '鏄ㄥぉ ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 涓€鍛ㄥ唴
  if (diffMs < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
    return `${days}澶╁墠`
  }

  // 鏇存棭鐨勬椂闂?  return date.toLocaleDateString('zh-CN')
}

// 鑾峰彇娲诲姩绫诲瀷锛堢敤浜嶵imeline鏍峰紡锛?const getActivityType = (type: Activity['type']) => {
  switch (type) {
    case 'member':
      return 'primary'
    case 'project':
      return 'success'
    case 'team':
      return 'warning'
    case 'task':
      return 'info'
    default:
      return 'default'
  }
}

// 鑾峰彇娲诲姩鏍囩绫诲瀷
const getActivityTagType = (type: Activity['type']) => {
  switch (type) {
    case 'member':
      return 'primary'
    case 'project':
      return 'success'
    case 'team':
      return 'warning'
    case 'task':
      return 'info'
    default:
      return ''
  }
}

// 鑾峰彇娲诲姩绫诲瀷鏍囩
const getActivityTypeLabel = (type: Activity['type']) => {
  switch (type) {
    case 'member':
      return '鎴愬憳绠＄悊'
    case 'project':
      return '椤圭洰绠＄悊'
    case 'team':
      return '鍥㈤槦璁剧疆'
    case 'task':
      return '浠诲姟鎿嶄綔'
    default:
      return '鍏朵粬'
  }
}
</script>

<style scoped>
.team-activity-tab {
  padding: 20px 0;
}

.activity-header {
  margin-bottom: 24px;
}

.activity-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.activity-description {
  font-size: 14px;
  color: #909399;
}

.activity-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.type-filter {
  width: 150px;
}

.date-filter {
  width: 300px;
}

.activity-list {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.activity-card {
  margin-bottom: 8px;
  border: none;
}

.activity-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.activity-icon {
  flex-shrink: 0;
}

.activity-details {
  flex: 1;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.activity-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.activity-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.user-name {
  font-weight: 500;
  color: #409eff;
}

.activity-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
}

.meta-item .el-icon {
  font-size: 14px;
}

.empty-activity {
  padding: 40px 0;
  text-align: center;
}

.load-more {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
}

/* 鍝嶅簲寮忚璁?*/
@media (max-width: 768px) {
  .activity-filter {
    flex-direction: column;
  }

  .search-input,
  .type-filter,
  .date-filter {
    width: 100%;
  }

  .activity-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-meta {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .activity-list {
    padding: 16px;
  }

  .activity-card {
    padding: 12px;
  }
}
</style>
