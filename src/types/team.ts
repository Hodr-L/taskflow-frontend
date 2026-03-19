export interface Team {
  id: number
  name: string
  description: string
  avatar_url?: string
  owner_id: number
  privacy: 'public' | 'private'
  member_count?: number
  project_count?: number
  created_at: string
  updated_at?: string
}

export interface TeamMember {
  id: number
  team_id: number
  user_id: number
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user?: {
    id: number
    username: string
    email: string
    full_name?: string
    avatar_url?: string
  }
}

export interface TeamProject {
  id: number
  team_id: number
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
  id: number
  team_id: number
  email: string
  role: 'admin' | 'member'
  status: 'pending' | 'accepted' | 'expired'
  invited_by: number
  expires_at: string
  created_at: string
}

export interface TeamActivity {
  id: number
  team_id: number
  user_id: number
  type: 'member' | 'project' | 'team' | 'task' | 'other'
  action: string
  description: string
  details?: Record<string, any>
  created_at: string
  user?: {
    id: number
    username: string
    full_name?: string
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