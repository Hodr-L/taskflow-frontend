import { http } from './api'
import type { User } from '@/types/user'

// 获取用户列表（管理员）
export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
  email_verified?: boolean
}

// getUsers现在直接返回数据部分（由于api.ts拦截器返回response.data.data）
export interface UsersData {
  users: User[]  // 根据API文档，返回的是"users"数组
  pagination: {  // 根据API文档，返回的是"pagination"（小写）
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export const getUsers = (params: GetUsersParams = {}): Promise<UsersData> => {
  return http.get('/users/admin', { params }).then(data => {
    // 容错处理：data可能为null/undefined，或缺少所需字段
    if (!data || typeof data !== 'object') {
      console.warn('用户列表接口返回无效数据，使用默认值:', data)
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
    
    // 兼容不同的字段命名（user/users, Pagination/pagination）
    const users = data.users || data.user || []
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
    console.warn('获取用户列表失败，使用默认值:', error.message || error)
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

// 获取单个用户信息（管理员）
export const getUserById = (id: number): Promise<User> => {
  return http.get(`/users/admin/${id}`)
}

// 创建用户（管理员）
export interface CreateUserData {
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

// 更新用户信息（管理员）
export interface UpdateUserData {
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

// 删除用户（管理员）
export const deleteUser = (id: number): Promise<void> => {
  return http.delete(`/users/admin/${id}`)
}

// 重置用户密码（管理员）
export interface ResetPasswordData {
  new_password: string
}

export const resetUserPassword = (id: number, data: ResetPasswordData): Promise<void> => {
  return http.post(`/users/admin/${id}/reset-password`, data)
}

// 获取当前用户信息（个人）
export const getCurrentUser = (): Promise<User> => {
  return http.get('/users/profile')
}

// 更新当前用户信息（个人）
export const updateCurrentUser = (data: UpdateUserData): Promise<User> => {
  return http.put('/users/profile', data)
}

// 修改当前用户密码（个人）
export interface ChangePasswordData {
  old_password: string
  new_password: string
}

export const changeCurrentUserPassword = (data: ChangePasswordData): Promise<void> => {
  return http.put('/users/password', data)
}

// 获取用户统计信息（管理员）
export interface UserStats {
  total: number
  active: number
  inactive: number
  banned: number
  admin: number
  super_admin: number
  unverified: number
}

// getUserStats现在直接返回UserStats对象（由于api.ts拦截器返回response.data.data）
export const getUserStats = (): Promise<UserStats> => {
  return http.get('/users/admin/stats').then(result => {
    // 处理API返回null或undefined的情况
    if (!result) {
      console.warn('用户统计接口返回空数据，使用默认值')
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
    
    // 确保返回的数据符合UserStats格式
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
    // 如果API不可用，返回默认值
    console.warn('获取用户统计失败，使用默认值:', error.message || error)
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