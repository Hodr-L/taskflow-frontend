import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, title: '注册' }
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
        meta: { title: '仪表板', icon: 'dashboard' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: '个人资料', icon: 'user' }
      },
      {
        path: 'teams',
        name: 'TeamList',
        component: TeamList,
        meta: { title: '团队管理', icon: 'team' }
      },
      {
        path: 'teams/:id',
        name: 'TeamDetail',
        component: TeamDetail,
        meta: { title: '团队详情', hidden: true }
      },
      {
        path: 'projects',
        name: 'ProjectList',
        component: ProjectList,
        meta: { title: '项目管理', icon: 'project' }
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: ProjectDetail,
        meta: { title: '项目详情', hidden: true }
      },
      {
        path: 'tasks',
        name: 'TaskList',
        component: TaskList,
        meta: { title: '任务管理', icon: 'task' }
      },
      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: TaskDetail,
        meta: { title: '任务详情', hidden: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫 - 认证检查
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
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