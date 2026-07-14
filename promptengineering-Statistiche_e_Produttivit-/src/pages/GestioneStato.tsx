import React, { useState, useEffect } from 'react';

interface Stato {
  slug: string;
  valore_stato: string;
}

export const GestioneStato: React.FC = () => {
  const [valoreStato, setValoreStato] = useState('');
  const [stati, setStati] = useState<Stato[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStati = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/status');
      if (response.ok) {
        const data = await response.json();
        setStati(data.data);
      }
    } catch (err) {
      console.error('Errore nel caricamento degli stati:', err);
    }
  };

  useEffect(() => {
    fetchStati();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!valoreStato.trim()) {
      setError('Inserisci un valore per lo stato.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/add_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ valore_stato: valoreStato }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore durante l\'aggiunta dello stato.');
      } else {
        setSuccess(data.message || 'Stato aggiunto con successo!');
        setValoreStato('');
        fetchStati(); // Ricarica la lista
      }
    } catch (err) {
      setError('Impossibile connettersi al server.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Gestione Stato</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Aggiungi Nuovo Stato</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="valore_stato" className="block text-sm font-medium text-gray-700 mb-1">
              Valore Stato
            </label>
            <input
              type="text"
              id="valore_stato"
              value={valoreStato}
              onChange={(e) => setValoreStato(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="es. In Lavorazione"
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          {success && <div className="text-green-500 text-sm font-medium">{success}</div>}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-fit"
          >
            Aggiungi valore
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Stati Presenti</h2>
        
        {stati.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Nessuno stato presente nel database.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valore Stato
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stati.map((stato) => (
                  <tr key={stato.slug}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stato.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stato.valore_stato}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
