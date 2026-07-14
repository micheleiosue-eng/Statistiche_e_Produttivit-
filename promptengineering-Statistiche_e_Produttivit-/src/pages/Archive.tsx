import { Archive as ArchiveIcon, RotateCcw, Trash2 } from 'lucide-react'
import { useApp } from '../store/AppContext'

export function Archive() {
  const { tasks, updateTask, deleteTask } = useApp()

  const archivedTasks = tasks.filter((t) => t.archived)

  const handleRestore = (id: string) => {
    updateTask(id, { archived: false })
  }

  const handleDelete = (id: string) => {
    if (confirm('Eliminare definitivamente questo task?')) {
      deleteTask(id)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ArchiveIcon className="w-6 h-6 text-indigo-600" />
            Archivio
          </h1>
          <p className="text-slate-500 mt-1">
            Gestisci i task completati o non più necessari
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {archivedTasks.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <ArchiveIcon className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-900">Nessun task in archivio</p>
            <p>I task archiviati verranno visualizzati qui.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {archivedTasks.map((task) => (
              <li key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 line-through opacity-75">{task.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-1">{task.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRestore(task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Ripristina
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Elimina
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
