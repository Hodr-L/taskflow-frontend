import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 统一处理成功响应
    if (response.data.code >= 200 && response.data.code < 300) {
      return response.data
    } else {
      // 业务逻辑错误
      return Promise.reject(response.data)
    }
  },
  (error) => {
    // 处理HTTP错误
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          const authStore = useAuthStore()
          authStore.clearToken()
          window.location.href = '/login'
          break
          
        case 403:
          // 权限不足
          console.error('权限不足:', data.message)
          break
          
        case 404:
          // 资源不存在
          console.error('资源不存在:', data.message)
          break
          
        case 500:
          // 服务器错误
          console.error('服务器错误:', data.message)
          break
          
        default:
          console.error('请求错误:', data.message)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接')
    } else {
      // 请求配置错误
      console.error('请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// 导出常用的HTTP方法
export const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    api.get(url, config),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.post(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.put(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.patch(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    api.delete(url, config)
}

export default api