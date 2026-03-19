// 用户类型
export interface User {
  id: number
  username: string
  email: string
  avatar_url?: string
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'suspended'
  email_verified: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

// 登录请求
export interface LoginRequest {
  email: string
  password: string
}

// 注册请求
export interface RegisterRequest {
  username: string
  email: string
  password: string
}

// 认证响应
export interface AuthResponse {
  code: number
  message: string
  data: {
    access_token: string
    refresh_token?: string
    expires_in?: number
    token_type?: string
    user?: User
  }
}

// API响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: string
}