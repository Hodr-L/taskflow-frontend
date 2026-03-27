<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="app-title">{{ appName }}</h2>
        <p class="app-version">v{{ appVersion }}</p>
      </div>

      <el-menu :default-active="activeMenu" class="sidebar-menu" :collapse="isCollapse" router>
        <!-- 动态生成菜单项 -->
        <template v-for="item in menuItems" :key="item.path">
          <el-menu-item :index="item.path">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>

        <el-divider v-if="menuItems.length > 0" />

        <!-- 个人资料菜单项（始终显示） -->
        <el-menu-item index="/profile">
          <el-icon><UserFilled /></el-icon>
          <span>个人资料</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <el-button type="text" @click="toggleSidebar" class="collapse-button">
          <el-icon v-if="isCollapse"><Expand /></el-icon>
          <el-icon v-else><Fold /></el-icon>
          <span v-if="!isCollapse">收起菜单</span>
        </el-button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="navbar">
        <div class="navbar-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="navbar-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userAvatar" />
              <span class="username">{{ username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><UserFilled /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  House,
  User,
  Folder,
  List,
  UserFilled,
  Expand,
  Fold,
  ArrowDown,
  Setting,
  SwitchButton,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 应用信息
const appName = import.meta.env.VITE_APP_NAME
const appVersion = import.meta.env.VITE_APP_VERSION

// 侧边栏状态
const isCollapse = ref(false)

// 用户信息
const username = computed(() => authStore.username || '用户')
const userAvatar = computed(() => authStore.user?.avatar_url || '')
const userRole = computed(() => authStore.role)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title)
  return matched.map((item) => ({
    path: item.path,
    title: item.meta.title as string,
  }))
})

// 菜单项
const menuItems = computed(() => {
  const routes = router.getRoutes()
  const rootRoute = routes.find(route => route.path === '/')
  
  if (!rootRoute || !rootRoute.children) {
    return []
  }
  
  // 过滤出需要显示在菜单中的路由
  return rootRoute.children
    .filter(child => {
      const meta = child.meta || {}
      // 隐藏菜单项
      if (meta.hidden === true) {
        return false
      }
      
      // 检查是否需要管理员权限
      if (meta.requiresAdmin === true) {
        const isAdmin = userRole.value === 'admin' || userRole.value === 'super_admin'
        return isAdmin
      }
      
      return true
    })
    .map(child => ({
      // 构造完整路径（相对于根路由）
      path: child.path.startsWith('/') ? child.path : `/${child.path}`,
      title: (child.meta?.title as string) || child.name?.toString() || '',
      icon: (child.meta?.icon as string) || 'Menu'
    }))
    .filter(item => item.title && item.path !== '/profile') // 排除个人资料，单独显示
    .sort((a, b) => {
      // 简单排序：仪表板在最前面，其他按字母顺序
      if (a.path === '/dashboard') return -1
      if (b.path === '/dashboard') return 1
      return a.title.localeCompare(b.title)
    })
})



// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      // TODO: 跳转到设置页面
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = async () => {
  await authStore.userLogout()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #304156 0%, #263445 100%);
  color: #bfcbd9;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.sidebar.collapse {
  width: 64px;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-version {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0 0;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 12px;
  border-radius: 8px;
  color: #bfcbd9;
}

.sidebar-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: #fff;
}

.sidebar-menu .el-menu-item .el-icon {
  margin-right: 12px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-button {
  width: 100%;
  color: #bfcbd9;
  justify-content: center;
}

.collapse-button:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.navbar-left {
  flex: 1;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-weight: 500;
  color: #303133;
}

/* 内容区样式 */
.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1001;
  }

  .main-content {
    margin-left: 0;
  }

  .navbar {
    padding: 0 16px;
  }

  .content {
    padding: 16px;
  }
}
</style>
