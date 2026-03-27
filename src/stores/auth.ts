import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'
import { login, register, logout, getProfile } from '@/services/auth'

// JWT工具函数
const decodeJWT = (token: string): any => {
  try {
    // JWT格式: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    // 解码payload部分
    const payload = parts[1]
    // Base64解码（处理URL安全的Base64）
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('解码JWT失败:', error)
    return null
  }
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) {
      return true // 没有过期时间视为已过期
    }
    // exp是Unix时间戳（秒）
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    console.error('检查token过期失败:', error)
    return true // 解析失败视为已过期
  }
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 初始化：从localStorage加载token，但检查是否过期
  const storedToken = localStorage.getItem('token')
  if (storedToken) {
    if (isTokenExpired(storedToken)) {
      console.log('检测到过期的token，已清除')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } else {
      token.value = storedToken
      console.log('加载有效的token，长度:', storedToken.length)
    }
  }

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const username = computed(() => user.value?.username || '')
  const email = computed(() => user.value?.email || '')
  const role = computed(() => user.value?.role || 'user')

  // Actions
  const setToken = (newToken: string) => {
    console.log('设置token，长度:', newToken.length)
    token.value = newToken
    localStorage.setItem('token', newToken)
    console.log('token已保存到localStorage')
    
    // 验证保存结果
    const saved = localStorage.getItem('token')
    if (saved) {
      console.log('验证保存的token，前10位:', saved.substring(0, 10), '...')
    }
  }

  const clearToken = () => {
    token.value = null
    localStorage.removeItem('token')
  }

  const setUser = (userData: User) => {
    console.log('设置用户数据:', userData)
    console.log('用户角色:', userData.role)
    user.value = userData
    // 缓存用户数据到localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    console.log('用户数据已保存到localStorage')
    
    // 验证保存结果
    const saved = localStorage.getItem('user')
    if (saved) {
      const parsed = JSON.parse(saved)
      console.log('验证保存的用户数据，role:', parsed.role)
    }
  }

  const clearUser = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  // 登录
  const userLogin = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('开始登录，邮箱:', email)
      const response = await login({ email, password })
      console.log('登录API响应:', response)
      // api.ts拦截器返回response.data.data，所以response直接就是{access_token, ...}
      setToken(response.access_token)
      // 如果响应中包含用户信息，直接设置
      if (response.user) {
        console.log('响应中包含用户信息，role:', response.user.role)
        setUser(response.user)
      } else {
        console.log('响应中不包含用户信息，调用fetchUserProfile')
        await fetchUserProfile()
      }
      return { success: true }
    } catch (err: any) {
      console.error('登录出错:', err)
      error.value = err.message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const userRegister = async (username: string, email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await register({ username, email, password })
      // api.ts拦截器返回response.data.data，所以response直接就是{access_token, ...}
      setToken(response.access_token)
      // 如果响应中包含用户信息，直接设置
      if (response.user) {
        setUser(response.user)
      } else {
        await fetchUserProfile()
      }
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '注册失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 退出登录
  const userLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('退出登录失败:', err)
    } finally {
      clearToken()
      clearUser()
    }
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    if (!token.value) return

    try {
      // 首先尝试使用标准接口获取用户信息
      const response = await getProfile()
      setUser(response)
    } catch (err: any) {
      console.error('获取用户信息失败:', err)
      
      // 如果标准接口失败，检查错误信息
      if (err.message?.includes('user_id') || err.code === 401) {
        // 尝试从localStorage获取缓存的用户ID
        const cachedUser = localStorage.getItem('user')
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser)
            if (userData.id) {
              // 使用用户ID调用用户详情接口
              const { getUserById } = await import('@/services/user')
              const userResponse = await getUserById(userData.id)
              setUser(userResponse)
              return
            }
          } catch (cacheErr) {
            console.error('解析缓存用户数据失败:', cacheErr)
          }
        }
      }
      
      // 如果所有方法都失败，清除token
      clearToken()
    }
  }

  // 初始化时尝试从localStorage加载用户数据
  const cachedUser = localStorage.getItem('user')
  if (cachedUser) {
    try {
      const userData = JSON.parse(cachedUser)
      user.value = userData
      console.log('从localStorage加载用户数据，角色:', userData.role)
    } catch (err) {
      console.error('加载缓存用户数据失败:', err)
      localStorage.removeItem('user')
    }
  }

  // 初始化时获取用户信息（改为静默模式，不因失败而清除token）
  // 只有token存在时才尝试获取最新用户信息
  if (token.value) {
    // 如果有缓存的用户数据，延迟获取（让页面先显示）
    // 如果没有缓存数据，立即获取（但延迟1秒避免与登录流程冲突）
    const delay = cachedUser ? 5000 : 1000  // 有缓存时延迟5秒，无缓存时延迟1秒
    
    setTimeout(() => {
      // 再次检查token是否存在（可能在此期间用户已退出）
      if (!token.value) {
        console.log('token已不存在，跳过获取用户信息')
        return
      }
      
      // 避免重复获取：如果用户数据已经通过其他方式设置，且时间很近，可以跳过
      // 这里简单实现：总是获取最新信息，但捕获错误不影响状态
      fetchUserProfile().catch(err => {
        console.warn('初始化时获取用户信息失败（不影响登录状态）:', err.message)
        // 不调用clearToken()，保持当前登录状态
      })
    }, delay)
  }

  return {
    // 状态
    token,
    user,
    isLoading,
    error,

    // 计算属性
    isAuthenticated,
    username,
    email,
    role,

    // Actions
    userLogin,
    userRegister,
    userLogout,
    fetchUserProfile,
    clearToken,
    clearUser,
  }
})
