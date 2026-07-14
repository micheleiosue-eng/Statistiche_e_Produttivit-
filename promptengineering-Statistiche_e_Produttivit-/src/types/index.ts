export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  provider?: string
  createdAt?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  color: string
}

export interface Attachment {
  id: string
  taskId?: string
  fileName: string
  path: string
  type: string
  size: number
}

export interface Task {
  id: string
  title: string
  description: string
  notes: string
  links: string[]
  attachments: Attachment[]
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  dueDate: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  categoryId?: string | null
  projectId?: string | null
  favorite?: boolean
  archived?: boolean
  estimatedTime?: number | null // in minutes
  reminderDate?: string | null
  repeatType?: RepeatType | null
  repeatEvery?: number | null
  repeatEnd?: string | null
  repeatDays?: string[] | null
}

export interface Category {
  id: string
  userId: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  owner: string
  name: string
  description: string
  createdAt: string
}

export interface Goal {
  id: string
  userId: string
  type: 'daily' | 'weekly'
  target: number
  createdAt: string
}

export interface Notification {
  id: string
  message: string
  read: boolean
  createdAt: string
}

export interface AppState {
  members: TeamMember[]
  tasks: Task[]
  categories: Category[]
  projects: Project[]
  goals: Goal[]
  notifications: Notification[]
  folders?: any[]
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Da fare',
  in_progress: 'In corso',
  review: 'In revisione',
  done: 'Completato',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export const MEMBER_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#14b8a6',
  '#0ea5e9',
  '#84cc16',
  '#ef4444',
]
