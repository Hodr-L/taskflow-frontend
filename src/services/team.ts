import { http } from './api'
import type { Team, TeamMember, TeamProject, TeamInvitation, TeamActivity, TeamPermission } from '@/types/team'

// 获取团队列表
export interface GetTeamsParams {
  page?: number
  limit?: number
  search?: string
  type?: string
  privacy?: 'public' | 'private'
}

export interface TeamsData {
  teams: Team[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export const getTeams = (params: GetTeamsParams = {}): Promise<TeamsData> => {
  return http.get('/teams', { params })
}

// 获取单个团队信息
export const getTeamById = (id: number): Promise<Team> => {
  return http.get(`/teams/${id}`)
}

// 创建团队
export interface CreateTeamData {
  name: string
  description: string
  type?: string
  privacy?: 'public' | 'private'
  avatar_url?: string
}

export const createTeam = (data: CreateTeamData): Promise<Team> => {
  return http.post('/teams', data)
}

// 更新团队信息
export interface UpdateTeamData {
  name?: string
  description?: string
  privacy?: 'public' | 'private'
  avatar_url?: string
}

export const updateTeam = (id: number, data: UpdateTeamData): Promise<Team> => {
  return http.put(`/teams/${id}`, data)
}

// 删除团队
export const deleteTeam = (id: number): Promise<void> => {
  return http.delete(`/teams/${id}`)
}

// 获取团队成员列表
export interface GetTeamMembersParams {
  page?: number
  limit?: number
  search?: string
  role?: 'owner' | 'admin' | 'member'
}

export interface TeamMembersData {
  members: TeamMember[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export const getTeamMembers = (teamId: number, params: GetTeamMembersParams = {}): Promise<TeamMembersData> => {
  return http.get(`/teams/${teamId}/members`, { params })
}

// 邀请团队成员
export interface InviteMemberData {
  email: string
  role: 'admin' | 'member'
  message?: string
}

export const inviteTeamMember = (teamId: number, data: InviteMemberData): Promise<TeamInvitation> => {
  return http.post(`/teams/${teamId}/invitations`, data)
}

// 更新团队成员角色
export interface UpdateMemberRoleData {
  role: 'admin' | 'member'
}

export const updateTeamMemberRole = (teamId: number, userId: number, data: UpdateMemberRoleData): Promise<TeamMember> => {
  return http.put(`/teams/${teamId}/members/${userId}`, data)
}

// 移除团队成员
export const removeTeamMember = (teamId: number, userId: number): Promise<void> => {
  return http.delete(`/teams/${teamId}/members/${userId}`)
}

// 获取团队项目列表
export interface GetTeamProjectsParams {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'archived' | 'completed'
}

export interface TeamProjectsData {
  projects: TeamProject[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export const getTeamProjects = (teamId: number, params: GetTeamProjectsParams = {}): Promise<TeamProjectsData> => {
  return http.get(`/teams/${teamId}/projects`, { params })
}

// 获取团队活动日志
export interface GetTeamActivitiesParams {
  page?: number
  limit?: number
  type?: 'member' | 'project' | 'team' | 'task' | 'other'
  start_date?: string
  end_date?: string
}

export interface TeamActivitiesData {
  activities: TeamActivity[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export const getTeamActivities = (teamId: number, params: GetTeamActivitiesParams = {}): Promise<TeamActivitiesData> => {
  return http.get(`/teams/${teamId}/activities`, { params })
}

// 获取团队权限设置
export const getTeamPermissions = (teamId: number): Promise<TeamPermission> => {
  return http.get(`/teams/${teamId}/permissions`)
}

// 更新团队权限设置
export const updateTeamPermissions = (teamId: number, data: TeamPermission): Promise<TeamPermission> => {
  return http.put(`/teams/${teamId}/permissions`, data)
}

// 退出团队
export const leaveTeam = (teamId: number): Promise<void> => {
  return http.post(`/teams/${teamId}/leave`)
}

// 转让团队所有权
export interface TransferOwnershipData {
  new_owner_id: number
}

export const transferTeamOwnership = (teamId: number, data: TransferOwnershipData): Promise<Team> => {
  return http.post(`/teams/${teamId}/transfer`, data)
}

// 获取团队统计信息
export interface TeamStats {
  total_members: number
  total_projects: number
  active_projects: number
  completed_projects: number
  total_tasks: number
  completed_tasks: number
  average_progress: number
}

export const getTeamStats = (teamId: number): Promise<TeamStats> => {
  return http.get(`/teams/${teamId}/stats`)
}