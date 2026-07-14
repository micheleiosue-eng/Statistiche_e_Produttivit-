import type { Attachment } from "../types"
import React, { useRef, useEffect, useState } from "react"
import { Paperclip, FileText, Loader2 } from "lucide-react"
import { useApp } from "../store/AppContext"

interface Props {
    taskId: string
}

export function AttachmentUploader({ taskId }: Props) {
    const { fetchAttachments, uploadAttachment, deleteAttachment } = useApp()
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const API_URL = 'http://localhost:3001' // Per le path assolute degli upload

    const loadAttachments = React.useCallback(async () => {
        setLoading(true)
        const data = await fetchAttachments(taskId)
        setAttachments(data)
        setLoading(false)
    }, [taskId, fetchAttachments])

    useEffect(() => {
        loadAttachments()
    }, [loadAttachments])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return
        
        setLoading(true)
        for (const file of files) {
            await uploadAttachment(taskId, file)
        }
        await loadAttachments()
        // Reset
        e.target.value = ""
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Eliminare questo allegato?')) return
        setLoading(true)
        await deleteAttachment(id)
        await loadAttachments()
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="space-y-4">
            <div>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    multiple 
                    accept="image/*, application/pdf, .doc, .docx, .xls, .xlsx" 
                    onChange={handleUpload}
                    className="hidden"
                    disabled={loading}
                />
                
                <button
                    type="button"
                    onClick={handleButtonClick}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />}
                    <span>{loading ? 'Caricamento in corso...' : 'Seleziona file da allegare'}</span>
                </button>
            </div>
            
            {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {attachments.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                            <div className="flex items-center space-x-2 overflow-hidden">
                                {file.type.startsWith("image/") ? (
                                    <img src={`${API_URL}${file.path}`} alt={file.fileName} className="w-10 h-10 object-cover rounded border border-slate-200" />
                                ) : (
                                    <div className="w-10 h-10 bg-indigo-50 rounded flex items-center justify-center text-indigo-500 shrink-0 border border-indigo-100">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="text-xs truncate">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={file.fileName}>{file.fileName}</p>
                                    <p className="text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                                <a
                                    href={`${API_URL}${file.path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium px-2 py-1 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
                                >
                                    Apri
                                </a>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(file.id)}
                                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                >
                                    Elimina
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}