export interface Team {
  id: string
  name: string
  description: string
  avatar_url?: string
  owner_id: string
  privacy: 'public' | 'private'
  member_count?: number
  project_count?: number
  created_at: string
  updated_at?: string
  // 兼容后端返回的字段名
  members_count?: number
  projects_count?: number
  logo_url?: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user?: {
    id: string
    username: string
    email: string
    fullname?: string
    bio?: string
    avatar_url?: string
  }
}

export interface TeamProject {
  id: string
  team_id: string
  name: string
  description: string
  status: 'active' | 'archived' | 'completed'
  task_count?: number
  completed_tasks?: number
  progress?: number
  start_date?: string
  end_date?: string
  created_at: string
  updated_at?: string
}

export interface TeamInvitation {
  id: string
  team_id: string
  email: string
  role: 'admin' | 'member'
  status: 'pending' | 'accepted' | 'expired'
  invited_by: string
  expires_at: string
  created_at: string
}

export interface TeamActivity {
  id: string
  team_id: string
  user_id: string
  type: 'member' | 'project' | 'team' | 'task' | 'other'
  action: string
  description: string
  details?: Record<string, any>
  created_at: string
  user?: {
    id: string
    username: string
    fullname?: string
    bio?: string
    avatar_url?: string
  }
}

export interface TeamPermission {
  can_create_project: boolean
  can_invite_member: boolean
  can_delete_project: boolean
  can_edit_team: boolean
  can_manage_members: boolean
  can_archive_project: boolean
}
