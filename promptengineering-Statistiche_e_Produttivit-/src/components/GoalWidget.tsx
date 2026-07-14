import { useState, useMemo } from 'react'
import { Target, CheckCircle2 } from 'lucide-react'
import { useApp } from '../store/AppContext'

export function GoalWidget() {
  const { goals, tasks, addGoal, updateGoal } = useApp()
  const [target, setTarget] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  // Calcola i task completati oggi
  const completedToday = useMemo(() => {
    return tasks.filter(t => t.status === 'done' && t.updatedAt.slice(0, 10) === today).length
  }, [tasks, today])

  // Trova l'obiettivo giornaliero, o l'ultimo impostato
  const dailyGoal = useMemo(() => {
    return goals.find(g => g.type === 'daily')
  }, [goals])

  const handleSave = () => {
    const val = parseInt(target)
    if (isNaN(val) || val <= 0) return
    
    if (dailyGoal) {
      updateGoal(dailyGoal.id, { target: val })
    } else {
      addGoal({
        userId: 'current-user',
        type: 'daily',
        target: val,
      })
    }
    setIsEditing(false)
  }

  const progress = dailyGoal ? Math.min(100, Math.round((completedToday / dailyGoal.target) * 100)) : 0

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" /> Obiettivo Giornaliero
        </h2>
        {!isEditing && (
          <button 
            onClick={() => { setTarget(dailyGoal?.target.toString() || ''); setIsEditing(true) }}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Modifica
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2">
          <input 
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-24 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="es. 10"
            min="1"
          />
          <button onClick={handleSave} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded font-medium">Salva</button>
          <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded font-medium">Annulla</button>
        </div>
      ) : dailyGoal ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              {completedToday} / {dailyGoal.target} task
            </span>
            <span className="text-sm font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
          {progress >= 100 && (
            <p className="mt-3 text-xs font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Obiettivo raggiunto!
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-4 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500 mb-2">Nessun obiettivo impostato per oggi.</p>
          <button 
            onClick={() => { setTarget('5'); setIsEditing(true) }}
            className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100"
          >
            Imposta obiettivo
          </button>
        </div>
      )}
    </section>
  )
}
