import db from '../config/db.js';
import slugify from 'slugify';

export const addStatus = (req, res) => {
  const { valore_stato } = req.body;
  
  if (!valore_stato || typeof valore_stato !== 'string') {
      return res.status(400).json({ error: 'Il campo valore_stato è obbligatorio e deve essere una stringa.' });
  }

  const slug = slugify(valore_stato, { lower: true, strict: true });
  
  if (!slug) {
      return res.status(400).json({ error: 'Valore stato non valido per generare uno slug.' });
  }

  const stmt = db.prepare('INSERT INTO stato (slug, valore_stato) VALUES (?, ?)');
  stmt.run([slug, valore_stato], function(err) {
      if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(409).json({ error: 'Questo stato esiste già nel sistema.' });
          }
          console.error(err);
          return res.status(500).json({ error: 'Errore interno del server durante il salvataggio.' });
      }
      res.status(201).json({ message: 'Stato aggiunto con successo!', data: { slug, valore_stato } });
  });
  stmt.finalize();
};

export const getStatus = (req, res) => {
  db.all('SELECT * FROM stato', [], (err, rows) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Errore interno del server.' });
      }
      res.json({ data: rows });
  });
};
