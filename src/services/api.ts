import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'

// 标准API响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
  },
)

// 响应拦截器 - 更健壮的处理
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const responseData = response.data
    
    // 检查响应格式是否符合API标准
    if (!responseData || typeof responseData !== 'object') {
      console.warn('API返回非JSON格式响应:', responseData)
      return responseData
    }
    
    // 检查是否有code字段（标准API响应格式）
    if (typeof responseData.code !== 'number') {
      console.warn('API响应缺少code字段，返回原始数据:', responseData)
      return responseData
    }
    
    // 处理成功响应 (200-299)
    if (responseData.code >= 200 && responseData.code < 300) {
      // 容错处理：data字段可能不存在
      if ('data' in responseData) {
        return responseData.data
      } else {
        // 没有data字段，返回整个响应对象，但过滤掉code和message
        const { code, message, ...rest } = responseData
        // 如果rest为空，返回null（表示成功但无数据）
        return Object.keys(rest).length > 0 ? rest : null
      }
    } else {
      // 业务逻辑错误
      console.warn('API业务逻辑错误:', responseData.code, responseData.message)
      return Promise.reject({
        ...responseData,
        // 保持向后兼容：确保有message字段
        message: responseData.message || `业务错误: ${responseData.code}`
      })
    }
  },
  (error) => {
    // 处理HTTP错误
    if (error.response) {
      const { status, data } = error.response
      const url = error.config?.url || '未知URL'

      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          // 但对于某些特定的API（如/users/stats），不跳转登录页
          if (url.includes('/users/stats')) {
            console.warn('用户统计API返回401，但保持登录状态:', url)
            // 返回一个特殊的错误对象，让调用方知道是401但不需要跳转
            return Promise.reject({
              code: 401,
              message: '未授权访问用户统计',
              status: 401,
              url
            })
          }
          
          console.warn('认证过期，清除token并跳转到登录页:', url)
          const authStore = useAuthStore()
          authStore.clearToken()
          authStore.clearUser()
          window.location.href = '/login'
          break

        case 403:
          // 权限不足
          console.error('权限不足:', url, data?.message || '无权限')
          break

        case 404:
          // 资源不存在
          console.error('资源不存在:', url, data?.message || '未找到')
          break

        case 500:
          // 服务器错误
          console.error('服务器错误:', url, data?.message || '服务器内部错误')
          break

        default:
          console.error('请求错误:', url, `状态码: ${status}`, data?.message || '未知错误')
      }
      
      // 返回格式化的错误对象
      return Promise.reject({
        code: status,
        message: data?.message || `HTTP错误: ${status}`,
        status,
        url,
        data: data
      })
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接:', error.config?.url || '未知URL')
      return Promise.reject({
        code: 0,
        message: '网络错误，请检查网络连接',
        status: 0,
        url: error.config?.url
      })
    } else {
      // 请求配置错误
      console.error('请求配置错误:', error.message)
      return Promise.reject({
        code: -1,
        message: `请求配置错误: ${error.message}`,
        status: -1
      })
    }
  },
)

// 导出常用的HTTP方法
export const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => api.get(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.post(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.put(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.patch(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete(url, config),
}

// 辅助函数：安全地处理API响应
export const safeApiCall = async <T = any>(
  promise: Promise<T>,
  defaultValue?: T
): Promise<T> => {
  try {
    return await promise
  } catch (error: any) {
    console.warn('API调用失败，使用默认值:', error.message || error)
    return defaultValue as T
  }
}

// 辅助函数：检查API响应是否成功
export const isApiSuccess = (response: any): boolean => {
  return response && typeof response === 'object' && 
         response.code >= 200 && response.code < 300
}

export default api
