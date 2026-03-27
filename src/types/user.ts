// 鐢ㄦ埛绫诲瀷瀹氫箟
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

// 鐢ㄦ埛瑙掕壊鏂囨湰鏄犲皠
export const USER_ROLE_TEXT: Record<string, string> = {
  'super_admin': '瓒呯骇绠＄悊鍛?,
  'admin': '绠＄悊鍛?,
  'user': '鏅€氱敤鎴?,
  'pm': '椤圭洰缁忕悊',
  'designer': '璁捐甯?,
  'developer': '寮€鍙戝伐绋嬪笀',
  'writer': '鏂囨',
  'dba': '鏁版嵁搴撶鐞嗗憳'
}

// 鐢ㄦ埛鐘舵€佹枃鏈槧灏?export const USER_STATUS_TEXT: Record<string, string> = {
  'active': '娲昏穬',
  'inactive': '鏈縺娲?,
  'banned': '绂佺敤'
}

// 鐢ㄦ埛瑙掕壊鏍囩绫诲瀷鏄犲皠
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

// 鐢ㄦ埛鐘舵€佹爣绛剧被鍨嬫槧灏?export const USER_STATUS_TAG_TYPE: Record<string, string> = {
  'active': 'success',
  'inactive': 'info',
  'banned': 'danger'
}
