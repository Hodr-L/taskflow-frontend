export interface Task {
  id: number
  title: string
  description?: string
  project_id?: number
  project?: {
    id: number
    name: string
  }
  assignee_id?: number
  assignee?: {
    id: number
    username: string
    fullname?: string
    bio?: string
    avatar_url?: string
  }
  reporter_id?: number
  reporter?: {
    id: number
    username: string
    fullname?: string
    bio?: string
    avatar_url?: string
  }
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type?: 'feature' | 'bug' | 'improvement' | 'documentation' | 'other'
  estimate_hours?: number
  actual_hours?: number
  due_date?: string
  start_date?: string
  completed_at?: string
  tags: string[]
  attachments?: string[]
  comments_count?: number
  subtasks_count?: number
  completed_subtasks_count?: number
  created_at: string
  updated_at?: string
}

export interface Subtask {
  id: number
  task_id: number
  title: string
  description?: string
  assignee_id?: number
  assignee?: {
    id: number
    username: string
    fullname?: string
    bio?: string
    avatar_url?: string
  }
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at?: string
}

export interface TaskComment {
  id: number
  task_id: number
  user_id: number
  content: string
  attachments?: string[]
  parent_id?: number
  is_edited: boolean
  created_at: string
  updated_at?: string
  user?: {
    id: number
    username: string
    fullname?: string
    bio?: string
    avatar_url?: string
  }
  replies?: TaskComment[]
}

export interface TaskAttachment {
  id: number
  task_id: number
  filename: string
  original_name: string
  mime_type: string
  size: number
  url: string
  uploaded_by: number
  uploaded_at: string
  uploaded_by_user?: {
    id: number
    username: string
    fullname?: string
    bio?: string
    avatar_url?: string
  }
}

export interface TaskActivity {
  id: number
  task_id: number
  user_id: number
  type: 'create' | 'update' | 'assign' | 'status_change' | 'comment' | 'attachment'
  action: string
  description: string
  old_value?: any
  new_value?: any
  created_at: string
  user?: {
    id: number
    username: string
    fullname?: string
    bio?: string
    avatar_url?: string
  }
}

export interface TaskFilter {
  status?: string[]
  priority?: string[]
  assignee_id?: number
  reporter_id?: number
  project_id?: number
  due_date_from?: string
  due_date_to?: string
  tags?: string[]
  search?: string
}

export interface TaskStatistics {
  total_tasks: number
  todo_tasks: number
  in_progress_tasks: number
  review_tasks: number
  done_tasks: number
  overdue_tasks: number
  total_estimate_hours: number
  total_actual_hours: number
  completion_rate: number
}

export interface TaskPermission {
  can_create_task: boolean
  can_edit_task: boolean
  can_delete_task: boolean
  can_assign_task: boolean
  can_change_status: boolean
  can_add_comment: boolean
  can_add_attachment: boolean
  can_create_subtask: boolean
}
