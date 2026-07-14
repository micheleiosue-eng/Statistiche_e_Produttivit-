import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { Trash2 } from 'lucide-react';

export const GestioneProgetti: React.FC = () => {
  const { projects, addProject, deleteProject, fetchProjects } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Inserisci un nome per il progetto.');
      return;
    }

    try {
      await addProject({ name, description, owner: 'user_1' });
      setName('');
      setDescription('');
    } catch (err) {
      setError('Errore durante il salvataggio.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Gestione Progetti</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Aggiungi Progetto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Progetto
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="es. Restyling Sito Web"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione (opzionale)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descrizione breve..."
              rows={3}
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-fit"
          >
            Crea Progetto
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">I Tuoi Progetti</h2>
        
        {projects.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Nessun progetto presente.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div 
                key={proj.id} 
                className="flex flex-col p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">{proj.name}</span>
                  <button 
                    onClick={() => deleteProject(proj.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Elimina"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-sm text-gray-500">{proj.description || 'Nessuna descrizione'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
