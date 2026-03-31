export interface Project {
  id: string
  name: string
  description: string
  team_id?: string
  team?: {
    id: string
    name: string
    avatar_url?: string
  }
  owner_id: string
  owner?: {
    id: string
    username: string
    fullname?: string
    bio?: string
    avatar_url?: string
  }
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress: number
  start_date?: string
  end_date?: string
  deadline?: string
  budget?: number
  actual_cost?: number
  tags: string[]
  members_count?: number
  tasks_count?: number
  completed_tasks_count?: number
  created_at: string
  updated_at?: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: 'manager' | 'developer' | 'designer' | 'tester' | 'viewer'
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

export interface ProjectStatistics {
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  active_members: number
  total_comments: number
  total_attachments: number
  progress_by_status: Record<string, number>
}

export interface ProjectMilestone {
  id: string
  project_id: string
  title: string
  description?: string
  due_date: string
  completed: boolean
  completed_at?: string
  completed_by?: string
  tasks_count?: number
  completed_tasks_count?: number
  created_at: string
  updated_at?: string
}

export interface ProjectUpdate {
  id: string
  project_id: string
  author_id: string
  title: string
  content: string
  attachments?: string[]
  is_pinned: boolean
  created_at: string
  updated_at?: string
  author?: {
    id: string
    username: string
    fullname?: string
    bio?: string
    avatar_url?: string
  }
}

export interface ProjectPermission {
  can_edit_project: boolean
  can_delete_project: boolean
  can_manage_members: boolean
  can_create_task: boolean
  can_edit_task: boolean
  can_delete_task: boolean
  can_create_milestone: boolean
  can_edit_milestone: boolean
  can_delete_milestone: boolean
  can_create_update: boolean
  can_edit_update: boolean
  can_delete_update: boolean
}
