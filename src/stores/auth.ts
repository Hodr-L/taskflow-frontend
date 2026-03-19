import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'
import { login, register, logout, getProfile } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const username = computed(() => user.value?.username || '')
  const email = computed(() => user.value?.email || '')
  const role = computed(() => user.value?.role || 'user')

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const clearToken = () => {
    token.value = null
    localStorage.removeItem('token')
  }

  const setUser = (userData: User) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
  }

  // 登录
  const userLogin = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await login({ email, password })
      setToken(response.data.access_token)
      await fetchUserProfile()
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || '登录失败'
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
      setToken(response.data.access_token)
      await fetchUserProfile()
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || '注册失败'
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
      const response = await getProfile()
      setUser(response.data)
    } catch (err) {
      console.error('获取用户信息失败:', err)
      clearToken()
    }
  }

  // 初始化时获取用户信息
  if (token.value) {
    fetchUserProfile()
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
    clearUser
  }
})