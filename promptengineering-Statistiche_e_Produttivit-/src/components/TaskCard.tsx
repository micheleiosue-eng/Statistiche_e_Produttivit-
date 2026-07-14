import { Calendar, GripVertical, Paperclip, Star, Archive, Clock } from 'lucide-react'
import type { Task } from '../types'
import { useApp } from '../store/AppContext'
import { formatDate, isOverdue } from '../utils/helpers'
import { MemberAvatar } from './MemberAvatar'
import { PriorityBadge } from './PriorityBadge'

interface TaskCardProps {
  task: Task
  onClick: () => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
}

export function TaskCard({
  task,
  onClick,
  draggable = false,
  onDragStart,
}: TaskCardProps) {
  const { getMember, categories, projects, updateTask } = useApp()
  const assignee = getMember(task.assigneeId)
  const category = categories.find(c => c.id === task.categoryId)
  const project = projects.find(p => p.id === task.projectId)
  const overdue = isOverdue(task.dueDate, task.status)

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateTask(task.id, { archived: true })
  }

  const formatEstimatedTime = (min: number) => {
    if (min < 60) return `${min}m`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`relative group bg-white rounded-xl border p-3.5 cursor-pointer hover:shadow-md transition-all ${task.favorite ? 'border-yellow-300' : 'border-slate-200 hover:border-indigo-300'}`}
    >
      <div className="flex items-start gap-2">
        {draggable && (
          <GripVertical className="w-4 h-4 text-slate-300 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h4 className="text-sm font-semibold text-slate-900 leading-snug">
              {task.favorite && <Star className="inline w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" />}
              {task.title}
            </h4>
            {!task.archived && (
              <button
                onClick={handleArchive}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-all shrink-0"
                title="Archivia"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mb-2">
            {category && (
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {category.name}
              </span>
            )}
            {project && (
              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-medium">
                {project.name}
              </span>
            )}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={task.priority} />
              
              {task.estimatedTime && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-slate-500" title="Tempo stimato">
                  <Clock className="w-3.5 h-3.5" />
                  {formatEstimatedTime(task.estimatedTime)}
                </span>
              )}

              {task.attachments && task.attachments.length > 0 && (
                <span
                  className="flex items-center gap-0.5 text-xs text-slate-400"
                  title={`${task.attachments.length} allegati`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  {task.attachments.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {task.dueDate && (
                <span
                  className={`flex items-center gap-1 text-[11px] ${
                    overdue ? 'text-red-600 font-medium' : 'text-slate-500'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}
              {assignee && (
                <MemberAvatar
                  name={assignee.name}
                  color={assignee.color}
                  size="sm"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
