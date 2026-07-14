import db from '../config/db.js';
import crypto from 'crypto';

export const getCategories = (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

export const createCategory = (req, res) => {
  const { userId, name, color } = req.body;
  const id = req.body.id || crypto.randomUUID();
  const createdAt = req.body.createdAt || new Date().toISOString();
  const updatedAt = req.body.updatedAt || new Date().toISOString();
  
  db.run(
    'INSERT INTO categories (id, userId, name, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, name, color, createdAt, updatedAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, userId, name, color, createdAt, updatedAt });
    }
  );
};

export const updateCategory = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = Object.keys(updates);
  if (fields.length === 0) return res.status(400).json({ error: 'Nessun campo specificato per l\'aggiornamento' });

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  db.run(`UPDATE categories SET ${setClause} WHERE id = ?`, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...updates });
  });
};

export const deleteCategory = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM categories WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Categoria rimossa con successo' });
  });
};
