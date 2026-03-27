import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 布局组件
import Layout from '@/layouts/Layout.vue'

// 页面组件
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import Dashboard from '@/views/dashboard/Dashboard.vue'
import Profile from '@/views/user/Profile.vue'

// 团队相关
import TeamList from '@/views/team/TeamList.vue'
import TeamDetail from '@/views/team/TeamDetail.vue'

// 项目相关
import ProjectList from '@/views/project/ProjectList.vue'
import ProjectDetail from '@/views/project/ProjectDetail.vue'

// 任务相关
import TaskList from '@/views/task/TaskList.vue'
import TaskDetail from '@/views/task/TaskDetail.vue'

// 用户管理
import UserList from '@/views/user/UserList.vue'
import UserDetail from '@/views/user/UserDetail.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, title: '注册' },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '仪表板', icon: 'House' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: '个人资料', icon: 'UserFilled' },
      },
      {
        path: 'teams',
        name: 'TeamList',
        component: TeamList,
        meta: { title: '团队管理', icon: 'User' },
      },
      {
        path: 'teams/:id',
        name: 'TeamDetail',
        component: TeamDetail,
        meta: { title: '团队详情', hidden: true },
      },
      {
        path: 'projects',
        name: 'ProjectList',
        component: ProjectList,
        meta: { title: '项目管理', icon: 'Folder' },
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: ProjectDetail,
        meta: { title: '项目详情', hidden: true },
      },
      {
        path: 'tasks',
        name: 'TaskList',
        component: TaskList,
        meta: { title: '任务管理', icon: 'List' },
      },
      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: TaskDetail,
        meta: { title: '任务详情', hidden: true },
      },
      {
        path: 'users',
        name: 'UserList',
        component: UserList,
        meta: { title: '用户管理', icon: 'User', requiresAdmin: true },
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: UserDetail,
        meta: { title: '用户详情', hidden: true, requiresAdmin: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 检查用户是否有管理员权限
const checkAdminPermission = () => {
  const authStore = useAuthStore()
  let userRole = authStore.role
  
  console.log('=== 开始检查管理员权限 ===')
  console.log('1. Pinia store中的角色:', userRole)
  console.log('2. Pinia store完整对象:', { 
    token: authStore.token,
    user: authStore.user,
    role: authStore.role,
    isAuthenticated: authStore.isAuthenticated
  })
  
  // 检查localStorage
  const tokenInStorage = localStorage.getItem('token')
  const userInStorage = localStorage.getItem('user')
  console.log('3. localStorage中的token:', tokenInStorage ? `存在，长度: ${tokenInStorage.length}` : '不存在')
  console.log('4. localStorage中的user:', userInStorage || '不存在')
  
  // 如果Pinia store中的角色为空，尝试从localStorage读取
  if (!userRole) {
    try {
      if (userInStorage) {
        const userData = JSON.parse(userInStorage)
        userRole = userData.role
        console.log('5. 从localStorage解析的用户角色:', userRole, '完整用户数据:', userData)
      } else {
        console.log('5. localStorage中没有用户数据')
      }
    } catch (err) {
      console.error('从localStorage读取用户数据失败:', err)
    }
  }
  
  console.log('6. 最终判断的用户角色:', userRole)
  console.log('7. 是否为管理员?', userRole === 'admin' || userRole === 'super_admin')
  console.log('=== 结束检查管理员权限 ===')
  
  return userRole === 'admin' || userRole === 'super_admin'
}

// 路由守卫 - 认证和权限检查
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  console.log('路由守卫: 访问', to.path, 'token存在?', !!isAuthenticated, '需要认证?', to.meta.requiresAuth, '需要管理员?', to.meta.requiresAdmin)

  // 认证检查
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('未认证，重定向到登录页')
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    console.log('已认证，重定向到仪表板')
    next('/dashboard')
  } else {
    // 管理员权限检查
    if (to.meta.requiresAdmin) {
      if (checkAdminPermission()) {
        console.log('管理员权限验证通过')
        next()
      } else {
        // 非管理员尝试访问管理员页面，重定向到仪表板
        console.log('管理员权限验证失败，重定向到仪表板')
        next('/dashboard')
      }
    } else {
      next()
    }
  }
})

// 路由守卫 - 设置页面标题
router.afterEach((to) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - ${import.meta.env.VITE_APP_NAME}`
  }
})

export default router
