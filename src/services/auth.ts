import { http } from './api'
import type { LoginRequest, RegisterRequest, User, AuthResponse } from '@/types/auth'

// 用户登录
export const login = (data: LoginRequest): Promise<AuthResponse> => {
  return http.post('/auth/login', data)
}

// 用户注册
export const register = (data: RegisterRequest): Promise<AuthResponse> => {
  return http.post('/auth/register', data)
}

// 刷新token
export const refreshToken = (): Promise<AuthResponse> => {
  return http.post('/auth/refresh')
}

// 退出登录
export const logout = (): Promise<void> => {
  return http.post('/auth/logout')
}

// 获取用户信息
export const getProfile = (): Promise<{ data: User }> => {
  return http.get('/auth/profile')
}

// 更新用户信息
export const updateProfile = (data: Partial<User>): Promise<{ data: User }> => {
  return http.put('/auth/profile', data)
}

// 修改密码
export const changePassword = (data: { old_password: string; new_password: string }): Promise<void> => {
  return http.put('/auth/password', data)
}