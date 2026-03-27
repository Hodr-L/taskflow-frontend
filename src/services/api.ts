import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'

// 鏍囧噯API鍝嶅簲鏍煎紡
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

// 鍒涘缓axios瀹炰緥
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 璇锋眰鎷︽埅鍣?api.interceptors.request.use(
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

// 鍝嶅簲鎷︽埅鍣?- 鏇村仴澹殑澶勭悊
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const responseData = response.data
    
    // 妫€鏌ュ搷搴旀牸寮忔槸鍚︾鍚圓PI鏍囧噯
    if (!responseData || typeof responseData !== 'object') {
      console.warn('API杩斿洖闈濲SON鏍煎紡鍝嶅簲:', responseData)
      return responseData
    }
    
    // 妫€鏌ユ槸鍚︽湁code瀛楁锛堟爣鍑咥PI鍝嶅簲鏍煎紡锛?    if (typeof responseData.code !== 'number') {
      console.warn('API鍝嶅簲缂哄皯code瀛楁锛岃繑鍥炲師濮嬫暟鎹?', responseData)
      return responseData
    }
    
    // 澶勭悊鎴愬姛鍝嶅簲 (200-299)
    if (responseData.code >= 200 && responseData.code < 300) {
      // 瀹归敊澶勭悊锛歞ata瀛楁鍙兘涓嶅瓨鍦?      if ('data' in responseData) {
        return responseData.data
      } else {
        // 娌℃湁data瀛楁锛岃繑鍥炴暣涓搷搴斿璞★紝浣嗚繃婊ゆ帀code鍜宮essage
        const { code, message, ...rest } = responseData
        // 濡傛灉rest涓虹┖锛岃繑鍥瀗ull锛堣〃绀烘垚鍔熶絾鏃犳暟鎹級
        return Object.keys(rest).length > 0 ? rest : null
      }
    } else {
      // 涓氬姟閫昏緫閿欒
      console.warn('API涓氬姟閫昏緫閿欒:', responseData.code, responseData.message)
      return Promise.reject({
        ...responseData,
        // 淇濇寔鍚戝悗鍏煎锛氱‘淇濇湁message瀛楁
        message: responseData.message || `涓氬姟閿欒: ${responseData.code}`
      })
    }
  },
  (error) => {
    // 澶勭悊HTTP閿欒
    if (error.response) {
      const { status, data } = error.response
      const url = error.config?.url || '鏈煡URL'

      switch (status) {
        case 401:
          // 鏈巿鏉冿紝娓呴櫎token骞惰烦杞埌鐧诲綍椤?          // 浣嗗浜庢煇浜涚壒瀹氱殑API锛堝/users/stats锛夛紝涓嶈烦杞櫥褰曢〉
          if (url.includes('/users/stats')) {
            console.warn('鐢ㄦ埛缁熻API杩斿洖401锛屼絾淇濇寔鐧诲綍鐘舵€?', url)
            // 杩斿洖涓€涓壒娈婄殑閿欒瀵硅薄锛岃璋冪敤鏂圭煡閬撴槸401浣嗕笉闇€瑕佽烦杞?            return Promise.reject({
              code: 401,
              message: '鏈巿鏉冭闂敤鎴风粺璁?,
              status: 401,
              url
            })
          }
          
          console.warn('璁よ瘉杩囨湡锛屾竻闄oken骞惰烦杞埌鐧诲綍椤?', url)
          const authStore = useAuthStore()
          authStore.clearToken()
          authStore.clearUser()
          window.location.href = '/login'
          break

        case 403:
          // 鏉冮檺涓嶈冻
          console.error('鏉冮檺涓嶈冻:', url, data?.message || '鏃犳潈闄?)
          break

        case 404:
          // 璧勬簮涓嶅瓨鍦?          console.error('璧勬簮涓嶅瓨鍦?', url, data?.message || '鏈壘鍒?)
          break

        case 500:
          // 鏈嶅姟鍣ㄩ敊璇?          console.error('鏈嶅姟鍣ㄩ敊璇?', url, data?.message || '鏈嶅姟鍣ㄥ唴閮ㄩ敊璇?)
          break

        default:
          console.error('璇锋眰閿欒:', url, `鐘舵€佺爜: ${status}`, data?.message || '鏈煡閿欒')
      }
      
      // 杩斿洖鏍煎紡鍖栫殑閿欒瀵硅薄
      return Promise.reject({
        code: status,
        message: data?.message || `HTTP閿欒: ${status}`,
        status,
        url,
        data: data
      })
    } else if (error.request) {
      // 璇锋眰宸插彂鍑轰絾娌℃湁鏀跺埌鍝嶅簲
      console.error('缃戠粶閿欒锛岃妫€鏌ョ綉缁滆繛鎺?', error.config?.url || '鏈煡URL')
      return Promise.reject({
        code: 0,
        message: '缃戠粶閿欒锛岃妫€鏌ョ綉缁滆繛鎺?,
        status: 0,
        url: error.config?.url
      })
    } else {
      // 璇锋眰閰嶇疆閿欒
      console.error('璇锋眰閰嶇疆閿欒:', error.message)
      return Promise.reject({
        code: -1,
        message: `璇锋眰閰嶇疆閿欒: ${error.message}`,
        status: -1
      })
    }
  },
)

// 瀵煎嚭甯哥敤鐨凥TTP鏂规硶
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

// 杈呭姪鍑芥暟锛氬畨鍏ㄥ湴澶勭悊API鍝嶅簲
export const safeApiCall = async <T = any>(
  promise: Promise<T>,
  defaultValue?: T
): Promise<T> => {
  try {
    return await promise
  } catch (error: any) {
    console.warn('API璋冪敤澶辫触锛屼娇鐢ㄩ粯璁ゅ€?', error.message || error)
    return defaultValue as T
  }
}

// 杈呭姪鍑芥暟锛氭鏌PI鍝嶅簲鏄惁鎴愬姛
export const isApiSuccess = (response: any): boolean => {
  return response && typeof response === 'object' && 
         response.code >= 200 && response.code < 300
}

export default api
