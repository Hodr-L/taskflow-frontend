<template>
  <div class="layout-container">
    <!-- 渚ц竟鏍?-->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="app-title">{{ appName }}</h2>
        <p class="app-version">v{{ appVersion }}</p>
      </div>

      <el-menu :default-active="activeMenu" class="sidebar-menu" :collapse="isCollapse" router>
        <!-- 鍔ㄦ€佺敓鎴愯彍鍗曢」 -->
        <template v-for="item in menuItems" :key="item.path">
          <el-menu-item :index="item.path">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>

        <el-divider v-if="menuItems.length > 0" />

        <!-- 涓汉璧勬枡鑿滃崟椤癸紙濮嬬粓鏄剧ず锛?-->
        <el-menu-item index="/profile">
          <el-icon><UserFilled /></el-icon>
          <span>涓汉璧勬枡</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <el-button type="text" @click="toggleSidebar" class="collapse-button">
          <el-icon v-if="isCollapse"><Expand /></el-icon>
          <el-icon v-else><Fold /></el-icon>
          <span v-if="!isCollapse">鏀惰捣鑿滃崟</span>
        </el-button>
      </div>
    </aside>

    <!-- 涓诲唴瀹瑰尯 -->
    <div class="main-content">
      <!-- 椤堕儴瀵艰埅鏍?-->
      <header class="navbar">
        <div class="navbar-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">棣栭〉</el-breadcrumb-item>
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
                  涓汉璧勬枡
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  绯荤粺璁剧疆
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  閫€鍑虹櫥褰?                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 椤甸潰鍐呭 -->
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

// 搴旂敤淇℃伅
const appName = import.meta.env.VITE_APP_NAME
const appVersion = import.meta.env.VITE_APP_VERSION

// 渚ц竟鏍忕姸鎬?const isCollapse = ref(false)

// 鐢ㄦ埛淇℃伅
const username = computed(() => authStore.username || '鐢ㄦ埛')
const userAvatar = computed(() => authStore.user?.avatar_url || '')
const userRole = computed(() => authStore.role)

// 褰撳墠婵€娲荤殑鑿滃崟
const activeMenu = computed(() => route.path)

// 闈㈠寘灞戝鑸?const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title)
  return matched.map((item) => ({
    path: item.path,
    title: item.meta.title as string,
  }))
})

// 鑿滃崟椤?const menuItems = computed(() => {
  const routes = router.getRoutes()
  const rootRoute = routes.find(route => route.path === '/')
  
  if (!rootRoute || !rootRoute.children) {
    return []
  }
  
  // 杩囨护鍑洪渶瑕佹樉绀哄湪鑿滃崟涓殑璺敱
  return rootRoute.children
    .filter(child => {
      const meta = child.meta || {}
      // 闅愯棌鑿滃崟椤?      if (meta.hidden === true) {
        return false
      }
      
      // 妫€鏌ユ槸鍚﹂渶瑕佺鐞嗗憳鏉冮檺
      if (meta.requiresAdmin === true) {
        const isAdmin = userRole.value === 'admin' || userRole.value === 'super_admin'
        return isAdmin
      }
      
      return true
    })
    .map(child => ({
      // 鏋勯€犲畬鏁磋矾寰勶紙鐩稿浜庢牴璺敱锛?      path: child.path.startsWith('/') ? child.path : `/${child.path}`,
      title: (child.meta?.title as string) || child.name?.toString() || '',
      icon: (child.meta?.icon as string) || 'Menu'
    }))
    .filter(item => item.title && item.path !== '/profile') // 鎺掗櫎涓汉璧勬枡锛屽崟鐙樉绀?    .sort((a, b) => {
      // 绠€鍗曟帓搴忥細浠〃鏉垮湪鏈€鍓嶉潰锛屽叾浠栨寜瀛楁瘝椤哄簭
      if (a.path === '/dashboard') return -1
      if (b.path === '/dashboard') return 1
      return a.title.localeCompare(b.title)
    })
})



// 鍒囨崲渚ц竟鏍?const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 澶勭悊涓嬫媺鑿滃崟鍛戒护
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      // TODO: 璺宠浆鍒拌缃〉闈?      break
    case 'logout':
      handleLogout()
      break
  }
}

// 閫€鍑虹櫥褰?const handleLogout = async () => {
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

/* 渚ц竟鏍忔牱寮?*/
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

/* 涓诲唴瀹瑰尯鏍峰紡 */
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

/* 鍐呭鍖烘牱寮?*/
.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

/* 杩囨浮鍔ㄧ敾 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 鍝嶅簲寮忚璁?*/
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
