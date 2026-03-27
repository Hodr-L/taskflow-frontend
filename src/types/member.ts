export interface Member {
  id: number
  username: string
  email: string
  fullname?: string
  bio?: string
  avatar_url?: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  last_active_at?: string
  status?: 'active' | 'inactive' | 'pending'
}

export interface MemberWithTeam extends Member {
  team_id: number
  team_name?: string
  team_role?: string
}

export interface MemberInvitation {
  id: number
  email: string
  role: 'admin' | 'member'
  status: 'pending' | 'accepted' | 'expired'
  invited_by: number
  invited_by_name?: string
  expires_at: string
  created_at: string
}

export interface MemberActivity {
  id: number
  member_id: number
  type: 'login' | 'project' | 'task' | 'team' | 'profile'
  action: string
  description: string
  details?: Record<string, any>
  created_at: string
}

export interface MemberStats {
  total_projects: number
  total_tasks: number
  completed_tasks: number
  active_projects: number
  contribution_score: number
  last_activity: string
}
