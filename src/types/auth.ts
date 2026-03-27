// 鐢ㄦ埛绫诲瀷
export interface User {
  id: number
  username: string
  fullname?: string
  bio?: string
  email: string
  avatar_url?: string
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'banned'
  email_verified: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

// 鐧诲綍璇锋眰
export interface LoginRequest {
  email: string
  password: string
}

// 娉ㄥ唽璇锋眰
export interface RegisterRequest {
  username: string
  email: string
  password: string
}

// 璁よ瘉鍝嶅簲
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

// API鍝嶅簲鏍煎紡
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: string
}
