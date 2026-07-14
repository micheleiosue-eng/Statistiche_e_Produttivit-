import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { Trash2 } from 'lucide-react';

export const GestioneCategorie: React.FC = () => {
  const { categories, addCategory, deleteCategory, fetchCategories } = useApp();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Inserisci un nome per la categoria.');
      return;
    }

    try {
      await addCategory({ name, color, userId: 'user_1' });
      setName('');
      setColor('#3b82f6');
    } catch (err) {
      setError('Errore durante il salvataggio.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Gestione Categorie</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Aggiungi Categoria</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Categoria
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="es. Lavoro, Personale..."
              />
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Colore
              </label>
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-fit"
          >
            Crea Categoria
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Le Tue Categorie</h2>
        
        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Nessuna categoria presente.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: cat.color }}
                  ></div>
                  <span className="font-medium text-gray-800">{cat.name}</span>
                </div>
                <button 
                  onClick={() => deleteCategory(cat.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Elimina"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
