import db from '../config/db.js';

export const getAttachments = (req, res) => {
  const { taskId } = req.params;
  db.all('SELECT * FROM attachments WHERE taskId = ?', [taskId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

export const uploadAttachment = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nessun file caricato' });
  }

  const { id, taskId } = req.body;
  const fileName = req.file.originalname;
  const path = '/uploads/' + req.file.filename;
  const type = req.file.mimetype;
  const size = req.file.size;

  db.run(
    'INSERT INTO attachments (id, taskId, fileName, path, type, size) VALUES (?, ?, ?, ?, ?, ?)',
    [id, taskId, fileName, path, type, size],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, taskId, fileName, path, type, size });
    }
  );
};

export const deleteAttachment = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM attachments WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Allegato eliminato' });
  });
};
