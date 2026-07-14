import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { v4 as uuid } from 'uuid'
import { seedData } from '../data/seed'
import type {
  AppState,
  Task,
  TaskPriority,
  TaskStatus,
  TeamMember,
  Category,
  Project,
} from '../types'
import { MEMBER_COLORS } from '../types'

const initialState: AppState = {
  tasks: [],
  members: [],
  projects: [],
  categories: [],
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
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  // API base url
  const API_URL = 'http://localhost:3000/api'

  const commit = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev))
  }, [])

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`)
      const data = await res.json()
      commit(prev => ({ ...prev, tasks: data.data || [] }))
    } catch (e) { console.error(e) }
  }, [commit, API_URL])

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/members`)
      const data = await res.json()
      commit(prev => ({ ...prev, members: data.data || [] }))
    } catch (e) { console.error(e) }
  }, [commit, API_URL])

  useEffect(() => {
    fetchTasks()
    fetchMembers()
  }, [fetchTasks, fetchMembers])

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

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/categories`)
      const data = await res.json()
      commit(prev => ({ ...prev, categories: data.data || [] }))
    } catch (e) { console.error(e) }
  }, [commit, API_URL])

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

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/projects`)
      const data = await res.json()
      commit(prev => ({ ...prev, projects: data.data || [] }))
    } catch (e) { console.error(e) }
  }, [commit, API_URL])

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

  const resetData = useCallback(() => {
    // Per ora non facciamo nulla sul reset
  }, [])

  const getMember = useCallback(
    (id: string | null) =>
      id ? state.members.find((m) => m.id === id) : undefined,
    [state.members],
  )

  const tasksByStatus = useCallback(
    (status: TaskStatus) => state.tasks.filter((t) => t.status === status),
    [state.tasks],
  )

  const overdueTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return state.tasks.filter(
      (t) =>
        t.dueDate &&
        t.dueDate < today &&
        t.status !== 'done',
    )
  }, [state.tasks])

  const stats = useMemo(
    () => ({
      total: state.tasks.length,
      done: state.tasks.filter((t) => t.status === 'done').length,
      inProgress: state.tasks.filter((t) => t.status === 'in_progress').length,
      overdue: overdueTasks.length,
      completedOnTime: state.tasks.filter(
        (t) =>
          t.status === 'done' &&
          (!t.dueDate || t.updatedAt.slice(0, 10) <= t.dueDate),
      ).length,
      completedLate: state.tasks.filter(
        (t) =>
          t.status === 'done' &&
          !!t.dueDate &&
          t.updatedAt.slice(0, 10) > t.dueDate,
      ).length,
      inReview: state.tasks.filter((t) => t.status === 'review').length,
      todo: state.tasks.filter((t) => t.status === 'todo').length,
    }),
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
    }),
    [
      state,
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
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export type { TaskPriority, TaskStatus }
