import db from '../config/db.js';
import crypto from 'crypto';

export const getGoals = (req, res) => {
  db.all('SELECT * FROM goals', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

export const createGoal = (req, res) => {
  const { userId, type, target } = req.body;
  const id = req.body.id || crypto.randomUUID();
  const createdAt = req.body.createdAt || new Date().toISOString();
  
  db.run(
    'INSERT INTO goals (id, userId, type, target, createdAt) VALUES (?, ?, ?, ?, ?)',
    [id, userId, type, target, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, userId, type, target, createdAt });
    }
  );
};

export const updateGoal = (req, res) => {
  const { id } = req.params;
  const { target } = req.body;
  db.run('UPDATE goals SET target = ? WHERE id = ?', [target, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, target });
  });
};

export const deleteGoal = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM goals WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Goal eliminato' });
  });
};
