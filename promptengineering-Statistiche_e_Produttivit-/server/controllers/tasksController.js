import db from '../config/db.js';
import crypto from 'crypto';

export const getTasks = (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted = rows.map((r) => ({
      ...r,
      tags: JSON.parse(r.tags || '[]'),
      favorite: r.favorite === 1,
      archived: r.archived === 1,
      repeatDays: r.repeatDays ? JSON.parse(r.repeatDays) : null
    }));
    res.json(formatted);
  });
};

export const createTask = (req, res) => {
  const { 
    title, description, status, priority, assigneeId, folderId, dueDate, tags,
    categoryId, projectId, favorite, archived, estimatedTime, reminderDate, repeatType, repeatEvery, repeatEnd, repeatDays
  } = req.body;
  const id = req.body.id || crypto.randomUUID();
  const createdAt = req.body.createdAt || new Date().toISOString();
  const updatedAt = req.body.updatedAt || new Date().toISOString();
  
  const tagsStr = JSON.stringify(tags || []);
  const repeatDaysStr = repeatDays ? JSON.stringify(repeatDays) : null;
  const favInt = favorite ? 1 : 0;
  const archInt = archived ? 1 : 0;

  db.run(
    `INSERT INTO tasks (
      id, title, description, status, priority, assigneeId, folderId, dueDate, tags, createdAt, updatedAt,
      categoryId, projectId, favorite, archived, estimatedTime, reminderDate, repeatType, repeatEvery, repeatEnd, repeatDays
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, title, description, status, priority, assigneeId, folderId, dueDate, tagsStr, createdAt, updatedAt,
      categoryId || null, projectId || null, favInt, archInt, estimatedTime || null, reminderDate || null, 
      repeatType || null, repeatEvery || null, repeatEnd || null, repeatDaysStr
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ 
        id, title, description, status, priority, assigneeId, folderId, dueDate, tags, createdAt, updatedAt,
        categoryId, projectId, favorite: !!favorite, archived: !!archived, estimatedTime, reminderDate, repeatType, repeatEvery, repeatEnd, repeatDays 
      });
    }
  );
};

export const updateTask = (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body, updatedAt: new Date().toISOString() };
  
  if (updates.tags !== undefined) {
    updates.tags = JSON.stringify(updates.tags);
  }
  if (updates.repeatDays !== undefined) {
    updates.repeatDays = updates.repeatDays ? JSON.stringify(updates.repeatDays) : null;
  }
  if (updates.favorite !== undefined) {
    updates.favorite = updates.favorite ? 1 : 0;
  }
  if (updates.archived !== undefined) {
    updates.archived = updates.archived ? 1 : 0;
  }

  const fields = Object.keys(updates);
  if (fields.length === 0) return res.status(400).json({ error: 'Nessun campo specificato per l\'aggiornamento' });

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  db.run(`UPDATE tasks SET ${setClause} WHERE id = ?`, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    
    const responseData = { ...req.body };
    if (responseData.tags && typeof responseData.tags === 'string') {
      responseData.tags = JSON.parse(responseData.tags);
    }
    if (responseData.repeatDays && typeof responseData.repeatDays === 'string') {
      responseData.repeatDays = JSON.parse(responseData.repeatDays);
    }
    res.json({ id, ...responseData });
  });
};

export const deleteTask = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task eliminato con successo' });
  });
};
