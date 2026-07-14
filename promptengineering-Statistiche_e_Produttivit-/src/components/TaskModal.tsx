import { useEffect, useState } from 'react'
import { X, Trash2, Star } from 'lucide-react'
import type { Task, TaskPriority, TaskStatus, Attachment, RepeatType } from '../types'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '../types'
import { useApp } from '../store/AppContext'
import { AttachmentUploader } from './AttachmentUploader'

interface TaskModalProps {
  task?: Task | null
  defaultStatus?: TaskStatus
  open: boolean
  onClose: () => void
}

const emptyForm = {
  title: '',
  description: '',
  notes: '',
  links: '',
  attachments: [] as Attachment[],
  status: 'todo' as TaskStatus,
  priority: 'medium' as TaskPriority,
  assigneeId: '' as string,
  dueDate: '',
  tags: '',
  categoryId: '',
  projectId: '',
  favorite: false,
  estimatedTime: '' as string | number,
  reminderDate: '',
  repeatType: '' as RepeatType | '',
  repeatEvery: '' as string | number,
  repeatEnd: '',
}

export function TaskModal({
  task,
  defaultStatus = 'todo',
  open,
  onClose,
}: TaskModalProps) {
  const { members, categories, projects, addTask, updateTask, deleteTask } = useApp()
  const isEditing = !!task

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        notes: task.notes,
        links: task.links.join(', '),
        attachments: task.attachments || [],
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId ?? '',
        dueDate: task.dueDate ?? '',
        tags: task.tags.join(', '),
        categoryId: task.categoryId ?? '',
        projectId: task.projectId ?? '',
        favorite: !!task.favorite,
        estimatedTime: task.estimatedTime ?? '',
        reminderDate: task.reminderDate ? task.reminderDate.slice(0, 16) : '',
        repeatType: task.repeatType ?? '',
        repeatEvery: task.repeatEvery ?? '',
        repeatEnd: task.repeatEnd ? task.repeatEnd.slice(0, 10) : '',
      })
    } else {
      setForm({ ...emptyForm, status: defaultStatus })
    }
  }, [task, defaultStatus, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      notes: form.notes.trim(),
      links: form.links.split(',').map((l) => l.trim()).filter(Boolean),
      attachments: form.attachments,
      status: form.status,
      priority: form.priority,
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      categoryId: form.categoryId || null,
      projectId: form.projectId || null,
      favorite: form.favorite,
      estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : null,
      reminderDate: form.reminderDate ? new Date(form.reminderDate).toISOString() : null,
      repeatType: (form.repeatType as RepeatType) || null,
      repeatEvery: form.repeatEvery ? Number(form.repeatEvery) : null,
      repeatEnd: form.repeatEnd || null,
    }

    if (isEditing && task) {
      updateTask(task.id, payload)
    } else {
      addTask(payload)
    }
    onClose()
  }

  const handleDelete = () => {
    if (task && confirm('Eliminare questo task?')) {
      deleteTask(task.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Modifica task' : 'Nuovo task'}
            </h2>
            <button 
              type="button" 
              onClick={() => setForm(prev => ({ ...prev, favorite: !prev.favorite }))}
              className={`p-1.5 rounded-full transition-colors ${form.favorite ? 'text-yellow-400 bg-yellow-50' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
              title="Aggiungi ai preferiti"
            >
              <Star className="w-5 h-5" fill={form.favorite ? "currentColor" : "none"} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titolo *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Es. Implementare login utenti"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrizione</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Dettagli del task..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Appunti vari..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stato</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priorità</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Nessuna</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Progetto</label>
                  <select
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Nessuno</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assegnato a</label>
                  <select
                    value={form.assigneeId}
                    onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Non assegnato</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Scadenza</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tempo stimato (min)</label>
                  <input
                    type="number"
                    value={form.estimatedTime}
                    onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="es. 60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Promemoria</label>
                  <input
                    type="datetime-local"
                    value={form.reminderDate}
                    onChange={(e) => setForm({ ...form, reminderDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ricorrenza</label>
                  <select
                    value={form.repeatType}
                    onChange={(e) => setForm({ ...form, repeatType: e.target.value as RepeatType | '' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Non ricorrente</option>
                    <option value="daily">Ogni giorno</option>
                    <option value="weekly">Ogni settimana</option>
                    <option value="monthly">Ogni mese</option>
                    <option value="yearly">Ogni anno</option>
                  </select>
                </div>
                {form.repeatType && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Ogni (volte)</label>
                      <input
                        type="number"
                        min="1"
                        value={form.repeatEvery}
                        onChange={(e) => setForm({ ...form, repeatEvery: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Fino al</label>
                      <input
                        type="date"
                        value={form.repeatEnd}
                        onChange={(e) => setForm({ ...form, repeatEnd: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tag</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="es. frontend, bug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link</label>
                <input
                  type="text"
                  value={form.links}
                  onChange={(e) => setForm({ ...form, links: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>

            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-200">
             <label className="block text-sm font-medium text-slate-700 mb-2">Allegati</label>
             {isEditing && task ? (
               <AttachmentUploader taskId={task.id} />
             ) : (
               <p className="text-sm text-slate-500">Salva il task per poter caricare gli allegati.</p>
             )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4" />
                Elimina
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                {isEditing ? 'Salva' : 'Crea task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
