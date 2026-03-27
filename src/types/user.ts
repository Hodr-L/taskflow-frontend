// 用户类型定义
export interface User {
  id: number
  username: string
  email: string
  fullname?: string
  bio?: string
  avatar_url?: string
  role: 'user' | 'admin' | 'super_admin' | 'pm' | 'designer' | 'developer' | 'writer' | 'dba'
  status?: 'active' | 'inactive' | 'banned'
  email_verified?: boolean
  last_login_at?: string
  created_at?: string
  updated_at?: string
}

// 用户角色文本映射
export const USER_ROLE_TEXT: Record<string, string> = {
  'super_admin': '超级管理员',
  'admin': '管理员',
  'user': '普通用户',
  'pm': '项目经理',
  'designer': '设计师',
  'developer': '开发工程师',
  'writer': '文案',
  'dba': '数据库管理员'
}

// 用户状态文本映射
export const USER_STATUS_TEXT: Record<string, string> = {
  'active': '活跃',
  'inactive': '未激活',
  'banned': '禁用'
}

// 用户角色标签类型映射
export const USER_ROLE_TAG_TYPE: Record<string, string> = {
  'super_admin': 'danger',
  'admin': 'warning',
  'user': 'success',
  'pm': 'primary',
  'designer': 'info',
  'developer': '',
  'writer': 'success',
  'dba': 'info'
}

// 用户状态标签类型映射
export const USER_STATUS_TAG_TYPE: Record<string, string> = {
  'active': 'success',
  'inactive': 'info',
  'banned': 'danger'
}
