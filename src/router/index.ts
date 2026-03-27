import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 甯冨眬缁勪欢
import Layout from '@/layouts/Layout.vue'

// 椤甸潰缁勪欢
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import Dashboard from '@/views/dashboard/Dashboard.vue'
import Profile from '@/views/user/Profile.vue'

// 鍥㈤槦鐩稿叧
import TeamList from '@/views/team/TeamList.vue'
import TeamDetail from '@/views/team/TeamDetail.vue'

// 椤圭洰鐩稿叧
import ProjectList from '@/views/project/ProjectList.vue'
import ProjectDetail from '@/views/project/ProjectDetail.vue'

// 浠诲姟鐩稿叧
import TaskList from '@/views/task/TaskList.vue'
import TaskDetail from '@/views/task/TaskDetail.vue'

// 鐢ㄦ埛绠＄悊
import UserList from '@/views/user/UserList.vue'
import UserDetail from '@/views/user/UserDetail.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, title: '鐧诲綍' },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, title: '娉ㄥ唽' },
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
        meta: { title: '浠〃鏉?, icon: 'House' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: '涓汉璧勬枡', icon: 'UserFilled' },
      },
      {
        path: 'teams',
        name: 'TeamList',
        component: TeamList,
        meta: { title: '鍥㈤槦绠＄悊', icon: 'User' },
      },
      {
        path: 'teams/:id',
        name: 'TeamDetail',
        component: TeamDetail,
        meta: { title: '鍥㈤槦璇︽儏', hidden: true },
      },
      {
        path: 'projects',
        name: 'ProjectList',
        component: ProjectList,
        meta: { title: '椤圭洰绠＄悊', icon: 'Folder' },
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: ProjectDetail,
        meta: { title: '椤圭洰璇︽儏', hidden: true },
      },
      {
        path: 'tasks',
        name: 'TaskList',
        component: TaskList,
        meta: { title: '浠诲姟绠＄悊', icon: 'List' },
      },
      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: TaskDetail,
        meta: { title: '浠诲姟璇︽儏', hidden: true },
      },
      {
        path: 'users',
        name: 'UserList',
        component: UserList,
        meta: { title: '鐢ㄦ埛绠＄悊', icon: 'User', requiresAdmin: true },
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: UserDetail,
        meta: { title: '鐢ㄦ埛璇︽儏', hidden: true, requiresAdmin: true },
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

// 妫€鏌ョ敤鎴锋槸鍚︽湁绠＄悊鍛樻潈闄?const checkAdminPermission = () => {
  const authStore = useAuthStore()
  let userRole = authStore.role
  
  console.log('=== 寮€濮嬫鏌ョ鐞嗗憳鏉冮檺 ===')
  console.log('1. Pinia store涓殑瑙掕壊:', userRole)
  console.log('2. Pinia store瀹屾暣瀵硅薄:', { 
    token: authStore.token,
    user: authStore.user,
    role: authStore.role,
    isAuthenticated: authStore.isAuthenticated
  })
  
  // 妫€鏌ocalStorage
  const tokenInStorage = localStorage.getItem('token')
  const userInStorage = localStorage.getItem('user')
  console.log('3. localStorage涓殑token:', tokenInStorage ? `瀛樺湪锛岄暱搴? ${tokenInStorage.length}` : '涓嶅瓨鍦?)
  console.log('4. localStorage涓殑user:', userInStorage || '涓嶅瓨鍦?)
  
  // 濡傛灉Pinia store涓殑瑙掕壊涓虹┖锛屽皾璇曚粠localStorage璇诲彇
  if (!userRole) {
    try {
      if (userInStorage) {
        const userData = JSON.parse(userInStorage)
        userRole = userData.role
        console.log('5. 浠巐ocalStorage瑙ｆ瀽鐨勭敤鎴疯鑹?', userRole, '瀹屾暣鐢ㄦ埛鏁版嵁:', userData)
      } else {
        console.log('5. localStorage涓病鏈夌敤鎴锋暟鎹?)
      }
    } catch (err) {
      console.error('浠巐ocalStorage璇诲彇鐢ㄦ埛鏁版嵁澶辫触:', err)
    }
  }
  
  console.log('6. 鏈€缁堝垽鏂殑鐢ㄦ埛瑙掕壊:', userRole)
  console.log('7. 鏄惁涓虹鐞嗗憳?', userRole === 'admin' || userRole === 'super_admin')
  console.log('=== 缁撴潫妫€鏌ョ鐞嗗憳鏉冮檺 ===')
  
  return userRole === 'admin' || userRole === 'super_admin'
}

// 璺敱瀹堝崼 - 璁よ瘉鍜屾潈闄愭鏌?router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  console.log('璺敱瀹堝崼: 璁块棶', to.path, 'token瀛樺湪?', !!isAuthenticated, '闇€瑕佽璇?', to.meta.requiresAuth, '闇€瑕佺鐞嗗憳?', to.meta.requiresAdmin)

  // 璁よ瘉妫€鏌?  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('鏈璇侊紝閲嶅畾鍚戝埌鐧诲綍椤?)
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    console.log('宸茶璇侊紝閲嶅畾鍚戝埌浠〃鏉?)
    next('/dashboard')
  } else {
    // 绠＄悊鍛樻潈闄愭鏌?    if (to.meta.requiresAdmin) {
      if (checkAdminPermission()) {
        console.log('绠＄悊鍛樻潈闄愰獙璇侀€氳繃')
        next()
      } else {
        // 闈炵鐞嗗憳灏濊瘯璁块棶绠＄悊鍛橀〉闈紝閲嶅畾鍚戝埌浠〃鏉?        console.log('绠＄悊鍛樻潈闄愰獙璇佸け璐ワ紝閲嶅畾鍚戝埌浠〃鏉?)
        next('/dashboard')
      }
    } else {
      next()
    }
  }
})

// 璺敱瀹堝崼 - 璁剧疆椤甸潰鏍囬
router.afterEach((to) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - ${import.meta.env.VITE_APP_NAME}`
  }
})

export default router
