const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const slugify = require('slugify');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS stato (
            slug TEXT PRIMARY KEY,
            valore_stato TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            }
        });
    }
});

app.post('/api/add_status', (req, res) => {
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
});

app.get('/api/status', (req, res) => {
    db.all('SELECT * FROM stato', [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Errore interno del server.' });
        }
        res.json({ data: rows });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server is running on http://localhost:${PORT}`);
});
