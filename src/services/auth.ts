import { http } from './api'
import type { LoginRequest, RegisterRequest, User } from '@/types/auth'

// 鐢ㄦ埛鐧诲綍杩斿洖鐨勬暟鎹被鍨?export interface AuthData {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  user?: User
}

// 鐢ㄦ埛鐧诲綍
export const login = (data: LoginRequest): Promise<AuthData> => {
  return http.post('/auth/login', data)
}

// 鐢ㄦ埛娉ㄥ唽
export const register = (data: RegisterRequest): Promise<AuthData> => {
  return http.post('/auth/register', data)
}

// 鍒锋柊token
export const refreshToken = (): Promise<AuthData> => {
  return http.post('/auth/refresh')
}

// 閫€鍑虹櫥褰?export const logout = (): Promise<void> => {
  return http.post('/auth/token/logout')
}

// 鑾峰彇鐢ㄦ埛淇℃伅
export const getProfile = (): Promise<User> => {
  return http.get('/users/profile')
}

// 鏇存柊鐢ㄦ埛淇℃伅
export const updateProfile = (data: Partial<User>): Promise<User> => {
  return http.put('/users/profile', data)
}

// 淇敼瀵嗙爜
export const changePassword = (data: {
  old_password: string
  new_password: string
}): Promise<void> => {
  return http.put('/users/password', data)
}
