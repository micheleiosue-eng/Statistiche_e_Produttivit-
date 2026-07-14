import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import type { ReactNode } from 'react'
import type {
  AppState,
  Task,
  TaskPriority,
  TaskStatus,
  TeamMember,
  Category,
  Project,
  Goal,
  Attachment
} from '../types'
import { useAuth } from './AuthContext'

const initialState: AppState = {
  tasks: [],
  members: [],
  projects: [],
  categories: [],
  goals: [],
  notifications: []
}

interface AppContextValue extends AppState {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, status: TaskStatus) => Promise<void>
  addMember: (member: Omit<TeamMember, 'id' | 'color'>) => Promise<void>
  updateMember: (id: string, updates: Partial<TeamMember>) => Promise<void>
  deleteMember: (id: string) => Promise<void>
  fetchTasks: () => Promise<void>
  fetchMembers: () => Promise<void>
  resetData: () => void
  getMember: (id: string | null) => TeamMember | undefined
  tasksByStatus: (status: TaskStatus) => Task[]
  overdueTasks: Task[]
  stats: {
    total: number
    done: number
    inProgress: number
    overdue: number
    completedOnTime: number
    completedLate: number
    inReview: number
    todo: number
  }
  // Categories
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  fetchCategories: () => Promise<void>
  
  // Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  fetchProjects: () => Promise<void>
  
  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  fetchGoals: () => Promise<void>

  // Notifications
  fetchNotifications: () => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>

  // Attachments
  fetchAttachments: (taskId: string) => Promise<Attachment[]>
  uploadAttachment: (taskId: string, file: File) => Promise<void>
  deleteAttachment: (id: string) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  const API_URL = 'http://localhost:3001/api'

  const commit = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev))
  }, [])

  const { token, logout } = useAuth()

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!token) return new Response(null, { status: 401 });
    
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    const res = await fetch(url, { ...options, headers });
    
    if (res.status === 401 || res.status === 403) {
      logout();
      throw new Error('Non autorizzato');
    }
    
    return res;
  }, [token, logout])

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/tasks`)
      if (!res.ok) return
      const data = await res.json()
      
      const normalizedTasks = data.map((task: any) => ({
        ...task,
        notes: task.notes ?? '',
        links: task.links ?? [],
        attachments: task.attachments ?? [],
      }))
      
      commit(prev => ({ ...prev, tasks: normalizedTasks }))
    } catch (e) { console.error(e) }
  }, [commit, fetchWithAuth])

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/members`)
      if (!res.ok) return
      const data = await res.json()
      commit(prev => ({ ...prev, members: data || [] }))
    } catch (e) { console.error(e) }
  }, [commit, fetchWithAuth])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/categories`)
      if (!res.ok) return
      const data = await res.json()
      commit(prev => ({ ...prev, categories: data || [] }))
    } catch (e) { console.error(e) }
  }, [commit, fetchWithAuth])

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/projects`)
      if (!res.ok) return
      const data = await res.json()
      commit(prev => ({ ...prev, projects: data || [] }))
    } catch (e) { console.error(e) }
  }, [commit, fetchWithAuth])

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/goals`)
      if (!res.ok) return
      const data = await res.json()
      commit(prev => ({ ...prev, goals: data || [] }))
    } catch (e) { console.error(e) }
  }, [commit, fetchWithAuth])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/notifications`)
      if (!res.ok) return
      const data = await res.json()
      commit(prev => ({ ...prev, notifications: data || [] }))
    } catch (e) { console.error(e) }
  }, [commit, fetchWithAuth])

  useEffect(() => {
    fetchTasks()
    fetchMembers()
    fetchCategories()
    fetchProjects()
    fetchGoals()
    fetchNotifications()
    
    // Poll notifications every 30s
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchTasks, fetchMembers, fetchCategories, fetchProjects, fetchGoals, fetchNotifications])

  const addTask = useCallback(
    async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        })
        await fetchTasks()
      } catch (e) { console.error(e) }
    },
    [fetchTasks, API_URL],
  )

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        await fetch(`${API_URL}/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        await fetchTasks()
      } catch (e) { console.error(e) }
    },
    [fetchTasks, API_URL],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' })
        await fetchTasks()
      } catch (e) { console.error(e) }
    },
    [fetchTasks, API_URL],
  )

  const moveTask = useCallback(
    async (id: string, status: TaskStatus) => {
      await updateTask(id, { status })
    },
    [updateTask],
  )

  const addMember = useCallback(
    async (member: Omit<TeamMember, 'id' | 'color'>) => {
      try {
        await fetch(`${API_URL}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(member)
        })
        await fetchMembers()
      } catch (e) { console.error(e) }
    },
    [fetchMembers, API_URL],
  )

  const updateMember = useCallback(
    async (id: string, updates: Partial<TeamMember>) => {
      try {
        await fetch(`${API_URL}/members/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        await fetchMembers()
      } catch (e) { console.error(e) }
    },
    [fetchMembers, API_URL],
  )

  const deleteMember = useCallback(
    async (id: string) => {
      try {
        await fetch(`${API_URL}/members/${id}`, { method: 'DELETE' })
        await fetchMembers()
        await fetchTasks()
      } catch (e) { console.error(e) }
    },
    [fetchMembers, fetchTasks, API_URL],
  )

  const addCategory = useCallback(async (cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat)
      })
      await fetchCategories()
    } catch (e) { console.error(e) }
  }, [fetchCategories, API_URL])

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    try {
      await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      await fetchCategories()
    } catch (e) { console.error(e) }
  }, [fetchCategories, API_URL])

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' })
      await fetchCategories()
    } catch (e) { console.error(e) }
  }, [fetchCategories, API_URL])

  const addProject = useCallback(async (proj: Omit<Project, 'id' | 'createdAt'>) => {
    try {
      await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proj)
      })
      await fetchProjects()
    } catch (e) { console.error(e) }
  }, [fetchProjects, API_URL])

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      await fetch(`${API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      await fetchProjects()
    } catch (e) { console.error(e) }
  }, [fetchProjects, API_URL])

  const deleteProject = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' })
      await fetchProjects()
    } catch (e) { console.error(e) }
  }, [fetchProjects, API_URL])

  const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    try {
      await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      })
      await fetchGoals()
    } catch (e) { console.error(e) }
  }, [fetchGoals, API_URL])

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    try {
      await fetch(`${API_URL}/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      await fetchGoals()
    } catch (e) { console.error(e) }
  }, [fetchGoals, API_URL])

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/goals/${id}`, { method: 'DELETE' })
      await fetchGoals()
    } catch (e) { console.error(e) }
  }, [fetchGoals, API_URL])

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT' })
      await fetchNotifications()
    } catch (e) { console.error(e) }
  }, [fetchNotifications, API_URL])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' })
      await fetchNotifications()
    } catch (e) { console.error(e) }
  }, [fetchNotifications, API_URL])

  const fetchAttachments = useCallback(async (taskId: string) => {
    try {
      const res = await fetch(`${API_URL}/attachments/${taskId}`)
      return await res.json()
    } catch (e) { 
      console.error(e)
      return []
    }
  }, [API_URL])

  const uploadAttachment = useCallback(async (taskId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('id', crypto.randomUUID())
      formData.append('taskId', taskId)
      formData.append('file', file)
      await fetch(`${API_URL}/attachments`, {
        method: 'POST',
        body: formData
      })
    } catch (e) { console.error(e) }
  }, [API_URL])

  const deleteAttachment = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/attachments/${id}`, { method: 'DELETE' })
    } catch (e) { console.error(e) }
  }, [API_URL])

  const resetData = useCallback(() => {
    // Per ora non facciamo nulla sul reset
  }, [])

  const getMember = useCallback(
    (id: string | null) =>
      id ? state.members.find((m) => m.id === id) : undefined,
    [state.members],
  )

  const tasksByStatus = useCallback(
    (status: TaskStatus) => state.tasks.filter((t) => t.status === status && !t.archived),
    [state.tasks],
  )

  const overdueTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return state.tasks.filter(
      (t) =>
        !t.archived &&
        t.dueDate &&
        t.dueDate < today &&
        t.status !== 'done',
    )
  }, [state.tasks])

  const stats = useMemo(
    () => {
      const activeTasks = state.tasks.filter(t => !t.archived);
      return {
        total: activeTasks.length,
        done: activeTasks.filter((t) => t.status === 'done').length,
        inProgress: activeTasks.filter((t) => t.status === 'in_progress').length,
        overdue: overdueTasks.length,
        completedOnTime: activeTasks.filter(
          (t) =>
            t.status === 'done' &&
            (!t.dueDate || t.updatedAt.slice(0, 10) <= t.dueDate),
        ).length,
        completedLate: activeTasks.filter(
          (t) =>
            t.status === 'done' &&
            !!t.dueDate &&
            t.updatedAt.slice(0, 10) > t.dueDate,
        ).length,
        inReview: activeTasks.filter((t) => t.status === 'review').length,
        todo: activeTasks.filter((t) => t.status === 'todo').length,
      }
    },
    [state.tasks, overdueTasks],
  )

  const value = useMemo(
    () => ({
      ...state,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      addMember,
      updateMember,
      deleteMember,
      fetchTasks,
      fetchMembers,
      resetData,
      getMember,
      tasksByStatus,
      overdueTasks,
      stats,
      addCategory,
      updateCategory,
      deleteCategory,
      fetchCategories,
      addProject,
      updateProject,
      deleteProject,
      fetchProjects,
      addGoal,
      updateGoal,
      deleteGoal,
      fetchGoals,
      fetchNotifications,
      markNotificationRead,
      deleteNotification,
      fetchAttachments,
      uploadAttachment,
      deleteAttachment
    }),
    [
      state, addTask, updateTask, deleteTask, moveTask, addMember, updateMember, deleteMember,
      fetchTasks, fetchMembers, resetData, getMember, tasksByStatus, overdueTasks, stats,
      addCategory, updateCategory, deleteCategory, fetchCategories,
      addProject, updateProject, deleteProject, fetchProjects,
      addGoal, updateGoal, deleteGoal, fetchGoals,
      fetchNotifications, markNotificationRead, deleteNotification,
      fetchAttachments, uploadAttachment, deleteAttachment
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export type { TaskPriority, TaskStatus }
