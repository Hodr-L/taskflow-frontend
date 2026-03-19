// 用户类型定义
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