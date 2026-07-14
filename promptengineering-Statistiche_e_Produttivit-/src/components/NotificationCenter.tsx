import { Bell, Check, Trash2, CalendarClock } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useApp } from '../store/AppContext'
import { formatDate } from '../utils/helpers'

export function NotificationCenter() {
  const { notifications, markNotificationRead, deleteNotification } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref])

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 sm:right-auto sm:left-full sm:ml-2 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 origin-top-right sm:origin-top-left">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Notifiche</h3>
            <span className="text-xs text-slate-500 font-medium">{unreadCount} da leggere</span>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nessuna notifica</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map(n => (
                  <li key={n.id} className={`p-3 transition-colors hover:bg-slate-50 flex gap-3 ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                    <div className="shrink-0 mt-0.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!n.read ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        <CalendarClock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col gap-1">
                      {!n.read && (
                        <button 
                          onClick={() => markNotificationRead(n.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Segna come letto"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
