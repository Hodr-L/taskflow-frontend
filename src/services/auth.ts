import { http } from './api'
import type { LoginRequest, RegisterRequest, User } from '@/types/auth'

// 用户登录返回的数据类型
export interface AuthData {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  user?: User
}

// 用户登录
export const login = (data: LoginRequest): Promise<AuthData> => {
  return http.post('/auth/login', data)
}

// 用户注册
export const register = (data: RegisterRequest): Promise<AuthData> => {
  return http.post('/auth/register', data)
}

// 刷新token
export const refreshToken = (): Promise<AuthData> => {
  return http.post('/auth/refresh')
}

// 退出登录
export const logout = (): Promise<void> => {
  return http.post('/auth/token/logout')
}

// 获取用户信息
export const getProfile = (): Promise<User> => {
  return http.get('/users/profile')
}

// 更新用户信息
export const updateProfile = (data: Partial<User>): Promise<User> => {
  return http.put('/users/profile', data)
}

// 修改密码
export const changePassword = (data: {
  old_password: string
  new_password: string
}): Promise<void> => {
  return http.put('/users/password', data)
}
