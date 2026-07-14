import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Kanban,
  Users,
  Zap,
  Settings,
  Tags,
  FolderOpen,
  Calendar,
  Archive,
  LogOut
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { useAuth } from '../store/AuthContext'
import { useEffect } from 'react'
import { NotificationCenter } from './NotificationCenter'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/board', label: 'Board', icon: Kanban },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/gestione_stato', label: 'Stati', icon: Settings },
  { to: '/categorie', label: 'Categorie', icon: Tags },
  { to: '/archivio', label: 'Archivio', icon: Archive },
]

export function Sidebar() {
  const { stats, projects, fetchProjects } = useApp()
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return (
    <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200 flex-col">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              TeamFlow
            </h1>
            <p className="text-xs text-slate-500">Task Management</p>
          </div>
          <NotificationCenter />
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sezione Progetti */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center justify-between px-3 mb-2">
          <NavLink 
            to="/progetti"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-indigo-600 transition-colors"
          >
            Progetti
          </NavLink>
        </div>
        <div className="space-y-1">
          {projects.length === 0 ? (
            <p className="text-xs text-slate-400 px-3 italic">Nessun progetto</p>
          ) : (
            projects.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg cursor-pointer transition-colors">
                <FolderOpen className="w-4 h-4 shrink-0 text-indigo-400" />
                <span className="truncate">{p.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 flex-1 flex flex-col justify-end">
        <div className="bg-slate-50 rounded-xl p-3 space-y-2 mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Riepilogo
          </p>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white rounded-lg p-2 border border-slate-100">
              <p className="text-lg font-bold text-slate-900">{stats.total}</p>
              <p className="text-[10px] text-slate-500">Task totali</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-100">
              <p className="text-lg font-bold text-emerald-600">{stats.done}</p>
              <p className="text-[10px] text-slate-500">Completati</p>
            </div>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              title="Esci"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
