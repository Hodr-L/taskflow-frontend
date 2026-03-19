<template>
  <div class="team-activity-tab">
    <!-- 活动头部 -->
    <div class="activity-header">
      <h3>团队活动日志</h3>
      <p class="activity-description">查看团队的所有操作记录和活动历史</p>
    </div>

    <!-- 活动筛选 -->
    <div class="activity-filter">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索活动内容"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select
        v-model="filterType"
        placeholder="筛选活动类型"
        class="type-filter"
        clearable
      >
        <el-option label="全部" value="" />
        <el-option label="成员管理" value="member" />
        <el-option label="项目管理" value="project" />
        <el-option label="团队设置" value="team" />
        <el-option label="任务操作" value="task" />
      </el-select>
      
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="date-filter"
      />
    </div>

    <!-- 活动列表 -->
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
                  <el-tag
                    :type="getActivityTagType(activity.type)"
                    size="small"
                  >
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

      <!-- 空状态 -->
      <div v-if="filteredActivities.length === 0" class="empty-activity">
        <el-empty description="暂无活动记录" />
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMoreActivities">
        <el-button
          type="text"
          :loading="loadingMore"
          @click="loadMoreActivities"
        >
          加载更多活动记录
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

// 搜索和筛选
const searchKeyword = ref('')
const filterType = ref('')
const dateRange = ref<[Date, Date] | null>(null)

// 活动数据
const activities = ref<Activity[]>([
  {
    id: 1,
    type: 'member',
    title: '新成员加入',
    description: '加入了团队',
    timestamp: '2026-03-19T14:30:00Z',
    user: {
      id: 3,
      name: '王五',
      avatar_url: ''
    },
    details: {
      member_name: '王五'
    }
  },
  {
    id: 2,
    type: 'project',
    title: '创建新项目',
    description: '创建了项目',
    timestamp: '2026-03-18T10:15:00Z',
    user: {
      id: 2,
      name: '李四',
      avatar_url: ''
    },
    details: {
      project_name: '用户中心重构'
    }
  },
  {
    id: 3,
    type: 'team',
    title: '团队信息更新',
    description: '更新了团队描述',
    timestamp: '2026-03-17T16:45:00Z',
    user: {
      id: 1,
      name: '张三',
      avatar_url: ''
    },
    details: {
      old_value: '前端开发团队',
      new_value: '负责前端界面开发和用户体验优化'
    }
  },
  {
    id: 4,
    type: 'task',
    title: '完成任务',
    description: '完成了任务',
    timestamp: '2026-03-16T09:20:00Z',
    user: {
      id: 3,
      name: '王五',
      avatar_url: ''
    },
    details: {
      task_title: '设计用户中心界面',
      project_name: '用户中心重构'
    }
  },
  {
    id: 5,
    type: 'member',
    title: '角色变更',
    description: '的角色变更为管理员',
    timestamp: '2026-03-15T14:10:00Z',
    user: {
      id: 2,
      name: '李四',
      avatar_url: ''
    },
    details: {
      member_name: '李四',
      old_value: '成员',
      new_value: '管理员'
    }
  },
  {
    id: 6,
    type: 'project',
    title: '项目状态更新',
    description: '更新了项目状态',
    timestamp: '2026-03-14T11:30:00Z',
    user: {
      id: 1,
      name: '张三',
      avatar_url: ''
    },
    details: {
      project_name: 'TaskFlow 前端开发',
      old_value: '进行中',
      new_value: '已完成'
    }
  }
])

// 分页
const pageSize = 10
const currentPage = ref(1)
const loadingMore = ref(false)
const hasMoreActivities = ref(true)

// 计算属性：筛选后的活动
const filteredActivities = computed(() => {
  let filtered = activities.value
  
  // 按类型筛选
  if (filterType.value) {
    filtered = filtered.filter(activity => activity.type === filterType.value)
  }
  
  // 按搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(activity => 
      activity.title.toLowerCase().includes(keyword) ||
      activity.description.toLowerCase().includes(keyword) ||
      activity.user.name.toLowerCase().includes(keyword)
    )
  }
  
  // 按日期范围筛选
  if (dateRange.value) {
    const [start, end] = dateRange.value
    filtered = filtered.filter(activity => {
      const activityDate = new Date(activity.timestamp)
      return activityDate >= start && activityDate <= end
    })
  }
  
  // 分页
  return filtered.slice(0, pageSize * currentPage.value)
})

// 生命周期
onMounted(() => {
  loadActivities()
})

// 加载活动数据
const loadActivities = async () => {
  try {
    // TODO: 调用API获取活动数据
    console.log('加载团队活动数据，团队ID:', props.teamId)
  } catch (error) {
    console.error('加载活动数据失败:', error)
  }
}

// 加载更多活动
const loadMoreActivities = async () => {
  loadingMore.value = true
  
  try {
    // TODO: 调用API加载更多活动数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟添加更多数据
    const newActivities: Activity[] = [
      {
        id: activities.value.length + 1,
        type: 'task',
        title: '创建新任务',
        description: '创建了任务',
        timestamp: '2026-03-13T09:00:00Z',
        user: {
          id: 3,
          name: '王五',
          avatar_url: ''
        },
        details: {
          task_title: '优化页面加载性能',
          project_name: 'TaskFlow 前端开发'
        }
      },
      {
        id: activities.value.length + 2,
        type: 'member',
        title: '成员离开',
        description: '离开了团队',
        timestamp: '2026-03-12T16:30:00Z',
        user: {
          id: 4,
          name: '赵六',
          avatar_url: ''
        },
        details: {
          member_name: '赵六'
        }
      }
    ]
    
    activities.value.push(...newActivities)
    currentPage.value += 1
    
    // 检查是否还有更多数据
    hasMoreActivities.value = activities.value.length < 50 // 假设总共有50条数据
  } catch (error) {
    console.error('加载更多活动失败:', error)
  } finally {
    loadingMore.value = false
  }
}

// 格式化时间
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  // 如果是今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  
  // 如果是昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  
  // 一周内
  if (diffMs < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  
  // 更早的时间
  return date.toLocaleDateString('zh-CN')
}

// 获取活动类型（用于Timeline样式）
const getActivityType = (type: Activity['type']) => {
  switch (type) {
    case 'member': return 'primary'
    case 'project': return 'success'
    case 'team': return 'warning'
    case 'task': return 'info'
    default: return 'default'
  }
}

// 获取活动标签类型
const getActivityTagType = (type: Activity['type']) => {
  switch (type) {
    case 'member': return 'primary'
    case 'project': return 'success'
    case 'team': return 'warning'
    case 'task': return 'info'
    default: return ''
  }
}

// 获取活动类型标签
const getActivityTypeLabel = (type: Activity['type']) => {
  switch (type) {
    case 'member': return '成员管理'
    case 'project': return '项目管理'
    case 'team': return '团队设置'
    case 'task': return '任务操作'
    default: return '其他'
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

/* 响应式设计 */
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