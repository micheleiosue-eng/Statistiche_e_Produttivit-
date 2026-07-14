import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import db from './config/db.js';

// Esegue ogni minuto
cron.schedule('* * * * *', () => {
  const now = new Date();
  
  // 1. Controlla i promemoria imminenti
  db.all('SELECT * FROM tasks WHERE reminderDate IS NOT NULL AND status != "done"', [], (err, tasks) => {
    if (err) {
      console.error('Cron error fetching tasks:', err);
      return;
    }
    
    tasks.forEach(task => {
      const reminderTime = new Date(task.reminderDate);
      const diffMs = reminderTime - now;
      const diffMinutes = Math.floor(diffMs / 60000);
      
      // Se il promemoria scade nei prossimi 0-1 minuti
      if (diffMinutes === 0) {
        // Inserisci una notifica
        const id = uuidv4();
        const msg = `Promemoria: Il task "${task.title}" scade a breve!`;
        db.run('INSERT INTO notifications (id, message, read, createdAt) VALUES (?, ?, 0, ?)', 
          [id, msg, new Date().toISOString()]);
        
        // Resetta il reminderDate per non notificare di nuovo
        db.run('UPDATE tasks SET reminderDate = NULL WHERE id = ?', [task.id]);
      }
    });
  });

  // 2. Potenziale gestione delle ricorrenze (se un task è scaduto e ha una ricorrenza, creamo il clone)
  // Qui potremmo cercare i task scaduti con repeatType impostato, 
  // ma è più logico duplicarli quando vengono segnati come completati.
});
