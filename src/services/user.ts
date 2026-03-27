import { http } from './api'
import type { User } from '@/types/user'

// 鑾峰彇鐢ㄦ埛鍒楄〃锛堢鐞嗗憳锛?export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
  email_verified?: boolean
}

// getUsers鐜板湪鐩存帴杩斿洖鏁版嵁閮ㄥ垎锛堢敱浜巃pi.ts鎷︽埅鍣ㄨ繑鍥瀝esponse.data.data锛?export interface UsersData {
  users: User[]  // 鏍规嵁API鏂囨。锛岃繑鍥炵殑鏄?users"鏁扮粍
  pagination: {  // 鏍规嵁API鏂囨。锛岃繑鍥炵殑鏄?pagination"锛堝皬鍐欙級
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export const getUsers = (params: GetUsersParams = {}): Promise<UsersData> => {
  return http.get('/users/admin', { params }).then(data => {
    // 瀹归敊澶勭悊锛歞ata鍙兘涓簄ull/undefined锛屾垨缂哄皯鎵€闇€瀛楁
    if (!data || typeof data !== 'object') {
      console.warn('鐢ㄦ埛鍒楄〃鎺ュ彛杩斿洖鏃犳晥鏁版嵁锛屼娇鐢ㄩ粯璁ゅ€?', data)
      return {
        users: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          total_pages: 0
        }
      }
    }
    
    // 鍏煎涓嶅悓鐨勫瓧娈靛懡鍚嶏紙user/users, Pagination/pagination锛?    const users = data.users || data.user || []
    const pagination = data.Pagination || data.pagination || {
      page: 1,
      limit: 20,
      total: users.length,
      total_pages: Math.ceil(users.length / 20)
    }
    
    return {
      users: Array.isArray(users) ? users : [],
      pagination: {
        page: typeof pagination.page === 'number' ? pagination.page : 1,
        limit: typeof pagination.limit === 'number' ? pagination.limit : 20,
        total: typeof pagination.total === 'number' ? pagination.total : users.length,
        total_pages: typeof pagination.total_pages === 'number' ? pagination.total_pages : Math.ceil((pagination.total || users.length) / (pagination.limit || 20))
      }
    }
  }).catch(error => {
    console.warn('鑾峰彇鐢ㄦ埛鍒楄〃澶辫触锛屼娇鐢ㄩ粯璁ゅ€?', error.message || error)
    return {
      users: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0
      }
    }
  })
}

// 鑾峰彇鍗曚釜鐢ㄦ埛淇℃伅锛堢鐞嗗憳锛?export const getUserById = (id: number): Promise<User> => {
  return http.get(`/users/admin/${id}`)
}

// 鍒涘缓鐢ㄦ埛锛堢鐞嗗憳锛?export interface CreateUserData {
  username: string
  email: string
  password: string
  fullname?: string
  bio?: string
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'banned'
  avatar_url?: string
  email_verified?: boolean
}

export const createUser = (data: CreateUserData): Promise<User> => {
  return http.post('/users/admin', data)
}

// 鏇存柊鐢ㄦ埛淇℃伅锛堢鐞嗗憳锛?export interface UpdateUserData {
  username?: string
  email?: string
  fullname?: string
  bio?: string
  role?: 'user' | 'admin' | 'super_admin'
  status?: 'active' | 'inactive' | 'banned'
  avatar_url?: string
  email_verified?: boolean
}

export const updateUser = (id: number, data: UpdateUserData): Promise<User> => {
  return http.put(`/users/admin/${id}`, data)
}

// 鍒犻櫎鐢ㄦ埛锛堢鐞嗗憳锛?export const deleteUser = (id: number): Promise<void> => {
  return http.delete(`/users/admin/${id}`)
}

// 閲嶇疆鐢ㄦ埛瀵嗙爜锛堢鐞嗗憳锛?export interface ResetPasswordData {
  new_password: string
}

export const resetUserPassword = (id: number, data: ResetPasswordData): Promise<void> => {
  return http.post(`/users/admin/${id}/reset-password`, data)
}

// 鑾峰彇褰撳墠鐢ㄦ埛淇℃伅锛堜釜浜猴級
export const getCurrentUser = (): Promise<User> => {
  return http.get('/users/profile')
}

// 鏇存柊褰撳墠鐢ㄦ埛淇℃伅锛堜釜浜猴級
export const updateCurrentUser = (data: UpdateUserData): Promise<User> => {
  return http.put('/users/profile', data)
}

// 淇敼褰撳墠鐢ㄦ埛瀵嗙爜锛堜釜浜猴級
export interface ChangePasswordData {
  old_password: string
  new_password: string
}

export const changeCurrentUserPassword = (data: ChangePasswordData): Promise<void> => {
  return http.put('/users/password', data)
}

// 鑾峰彇鐢ㄦ埛缁熻淇℃伅锛堢鐞嗗憳锛?export interface UserStats {
  total: number
  active: number
  inactive: number
  banned: number
  admin: number
  super_admin: number
  unverified: number
}

// getUserStats鐜板湪鐩存帴杩斿洖UserStats瀵硅薄锛堢敱浜巃pi.ts鎷︽埅鍣ㄨ繑鍥瀝esponse.data.data锛?export const getUserStats = (): Promise<UserStats> => {
  return http.get('/users/admin/stats').then(result => {
    // 澶勭悊API杩斿洖null鎴杣ndefined鐨勬儏鍐?    if (!result) {
      console.warn('鐢ㄦ埛缁熻鎺ュ彛杩斿洖绌烘暟鎹紝浣跨敤榛樿鍊?)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        banned: 0,
        admin: 0,
        super_admin: 0,
        unverified: 0
      }
    }
    
    // 纭繚杩斿洖鐨勬暟鎹鍚圲serStats鏍煎紡
    const stats = {
      total: typeof result.total === 'number' ? result.total : 0,
      active: typeof result.active === 'number' ? result.active : 0,
      inactive: typeof result.inactive === 'number' ? result.inactive : 0,
      banned: typeof result.banned === 'number' ? result.banned : 0,
      admin: typeof result.admin === 'number' ? result.admin : 0,
      super_admin: typeof result.super_admin === 'number' ? result.super_admin : 0,
      unverified: typeof result.unverified === 'number' ? result.unverified : 0
    }
    
    return stats
  }).catch(error => {
    // 濡傛灉API涓嶅彲鐢紝杩斿洖榛樿鍊?    console.warn('鑾峰彇鐢ㄦ埛缁熻澶辫触锛屼娇鐢ㄩ粯璁ゅ€?', error.message || error)
    return {
      total: 0,
      active: 0,
      inactive: 0,
      banned: 0,
      admin: 0,
      super_admin: 0,
      unverified: 0
    }
  })
}