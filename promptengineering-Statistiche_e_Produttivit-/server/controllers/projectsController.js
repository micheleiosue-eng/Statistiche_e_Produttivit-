import db from '../config/db.js';
import crypto from 'crypto';

export const getProjects = (req, res) => {
  db.all('SELECT * FROM projects', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

export const createProject = (req, res) => {
  const { owner, name, description } = req.body;
  const id = req.body.id || crypto.randomUUID();
  const createdAt = req.body.createdAt || new Date().toISOString();
  
  db.run(
    'INSERT INTO projects (id, owner, name, description, createdAt) VALUES (?, ?, ?, ?, ?)',
    [id, owner, name, description, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, owner, name, description, createdAt });
    }
  );
};

export const updateProject = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = Object.keys(updates);
  if (fields.length === 0) return res.status(400).json({ error: 'Nessun campo specificato per l\'aggiornamento' });

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  db.run(`UPDATE projects SET ${setClause} WHERE id = ?`, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...updates });
  });
};

export const deleteProject = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM projects WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Progetto rimosso con successo' });
  });
};
