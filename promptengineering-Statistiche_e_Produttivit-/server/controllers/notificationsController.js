import db from '../config/db.js';

export const getNotifications = (req, res) => {
  db.all('SELECT * FROM notifications ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted = rows.map(r => ({ ...r, read: r.read === 1 }));
    res.json(formatted);
  });
};

export const markAsRead = (req, res) => {
  const { id } = req.params;
  db.run('UPDATE notifications SET read = 1 WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

export const deleteNotification = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM notifications WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};
