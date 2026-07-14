import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Errore di connessione al database SQLite:', err.message);
  } else {
    console.log('Connesso con successo al database SQLite:', dbPath);
  }
});

// Seed iniziale
const initialMembers = [
  { id: 'm1', name: 'Marco Rossi', email: 'marco.rossi@team.it', role: 'Project Manager', color: '#6366f1' },
  { id: 'm2', name: 'Laura Bianchi', email: 'laura.bianchi@team.it', role: 'Developer', color: '#8b5cf6' },
  { id: 'm3', name: 'Giuseppe Verdi', email: 'giuseppe.verdi@team.it', role: 'Designer', color: '#ec4899' },
  { id: 'm4', name: 'Anna Neri', email: 'anna.neri@team.it', role: 'QA Engineer', color: '#14b8a6' },
];

const initialFolders = [
  { id: 'f1', name: 'Sviluppo Frontend', color: '#6366f1' },
  { id: 'f2', name: 'Sviluppo Backend', color: '#8b5cf6' },
  { id: 'f3', name: 'Pianificazione', color: '#14b8a6' },
];

const initialTasks = [
  {
    id: 't1',
    title: 'Definire roadmap Q3',
    description: 'Allineare obiettivi del team e priorità per il prossimo trimestre.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'm1',
    folderId: 'f3',
    dueDate: '2026-07-15',
    tags: JSON.stringify(['planning']),
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-05T14:30:00Z',
    categoryId: null,
    projectId: null,
    favorite: 0,
    archived: 0,
    estimatedTime: 120,
    reminderDate: null,
    repeatType: null,
    repeatEvery: null,
    repeatEnd: null,
    repeatDays: null
  },
  {
    id: 't2',
    title: 'Implementare autenticazione',
    description: 'Login con email e OAuth, sessioni JWT e refresh token.',
    status: 'todo',
    priority: 'urgent',
    assigneeId: 'm2',
    folderId: 'f2',
    dueDate: '2026-07-12',
    tags: JSON.stringify(['backend', 'security']),
    createdAt: '2026-07-02T10:00:00Z',
    updatedAt: '2026-07-02T10:00:00Z',
    categoryId: null,
    projectId: null,
    favorite: 1,
    archived: 0,
    estimatedTime: 300,
    reminderDate: null,
    repeatType: null,
    repeatEvery: null,
    repeatEnd: null,
    repeatDays: null
  },
  {
    id: 't3',
    title: 'Redesign dashboard',
    description: 'Nuova UI con metriche, grafici e widget personalizzabili.',
    status: 'review',
    priority: 'medium',
    assigneeId: 'm3',
    folderId: 'f1',
    dueDate: '2026-07-20',
    tags: JSON.stringify(['design', 'ui']),
    createdAt: '2026-06-28T11:00:00Z',
    updatedAt: '2026-07-04T16:00:00Z',
    categoryId: null,
    projectId: null,
    favorite: 0,
    archived: 0,
    estimatedTime: 480,
    reminderDate: null,
    repeatType: null,
    repeatEvery: null,
    repeatEnd: null,
    repeatDays: null
  },
  {
    id: 't4',
    title: 'Test suite E2E',
    description: 'Coprire i flussi critici con Playwright.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'm4',
    folderId: 'f1',
    dueDate: '2026-07-25',
    tags: JSON.stringify(['testing']),
    createdAt: '2026-07-03T08:00:00Z',
    updatedAt: '2026-07-03T08:00:00Z',
    categoryId: null,
    projectId: null,
    favorite: 0,
    archived: 0,
    estimatedTime: null,
    reminderDate: null,
    repeatType: null,
    repeatEvery: null,
    repeatEnd: null,
    repeatDays: null
  },
  {
    id: 't5',
    title: 'Documentazione API',
    description: 'OpenAPI spec e esempi per tutti gli endpoint pubblici.',
    status: 'done',
    priority: 'low',
    assigneeId: 'm2',
    folderId: 'f2',
    dueDate: '2026-07-01',
    tags: JSON.stringify(['docs']),
    createdAt: '2026-06-20T09:00:00Z',
    updatedAt: '2026-06-30T17:00:00Z',
    categoryId: null,
    projectId: null,
    favorite: 0,
    archived: 1,
    estimatedTime: 60,
    reminderDate: null,
    repeatType: null,
    repeatEvery: null,
    repeatEnd: null,
    repeatDays: null
  },
  {
    id: 't6',
    title: 'Setup CI/CD pipeline',
    description: 'GitHub Actions per build, test e deploy automatico.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'm2',
    folderId: 'f2',
    dueDate: '2026-07-10',
    tags: JSON.stringify(['devops']),
    createdAt: '2026-07-04T12:00:00Z',
    updatedAt: '2026-07-05T09:00:00Z',
    categoryId: null,
    projectId: null,
    favorite: 1,
    archived: 0,
    estimatedTime: 240,
    reminderDate: null,
    repeatType: null,
    repeatEvery: null,
    repeatEnd: null,
    repeatDays: null
  },
];

export function initDb() {
  db.serialize(() => {
    // 0. Tabella users
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        provider TEXT DEFAULT 'local',
        resetToken TEXT,
        resetTokenExpiry TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // 1. Tabella members
    db.run(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        color TEXT NOT NULL
      )
    `);

    // 2. Tabella folders
    db.run(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      )
    `);

    // 3. Tabella tasks (aggiornata con folderId e nuovi campi)
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        assigneeId TEXT,
        folderId TEXT,
        dueDate TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        categoryId TEXT,
        projectId TEXT,
        favorite INTEGER DEFAULT 0,
        archived INTEGER DEFAULT 0,
        estimatedTime INTEGER,
        reminderDate TEXT,
        repeatType TEXT,
        repeatEvery INTEGER,
        repeatEnd TEXT,
        repeatDays TEXT,
        FOREIGN KEY (assigneeId) REFERENCES members(id) ON DELETE SET NULL,
        FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE SET NULL,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
      )
    `);

    // 4. Tabella categories
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // 5. Tabella projects
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        owner TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL
      )
    `);

    // 6. Tabella stato
    db.run(`
      CREATE TABLE IF NOT EXISTS stato (
        slug TEXT PRIMARY KEY,
        valore_stato TEXT NOT NULL
      )
    `);

    // 7. Tabella goals
    db.run(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        target INTEGER NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // 8. Tabella attachments
    db.run(`
      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        fileName TEXT NOT NULL,
        path TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);

    // 9. Tabella notifications
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        message TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      )
    `);

    // Eseguiamo il seed se le tabelle sono vuote
    db.get('SELECT COUNT(*) as count FROM members', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare('INSERT INTO members (id, name, email, role, color) VALUES (?, ?, ?, ?, ?)');
        initialMembers.forEach((m) => stmt.run(m.id, m.name, m.email, m.role, m.color));
        stmt.finalize();
        console.log('Seed members completato.');
      }
    });

    db.get('SELECT COUNT(*) as count FROM folders', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare('INSERT INTO folders (id, name, color) VALUES (?, ?, ?)');
        initialFolders.forEach((f) => stmt.run(f.id, f.name, f.color));
        stmt.finalize();
        console.log('Seed folders completato.');
      }
    });

    db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare('INSERT INTO tasks (id, title, description, status, priority, assigneeId, folderId, dueDate, tags, createdAt, updatedAt, categoryId, projectId, favorite, archived, estimatedTime, reminderDate, repeatType, repeatEvery, repeatEnd, repeatDays) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        initialTasks.forEach((t) => {
          stmt.run(t.id, t.title, t.description, t.status, t.priority, t.assigneeId, t.folderId, t.dueDate, t.tags, t.createdAt, t.updatedAt, t.categoryId, t.projectId, t.favorite, t.archived, t.estimatedTime, t.reminderDate, t.repeatType, t.repeatEvery, t.repeatEnd, t.repeatDays);
        });
        stmt.finalize();
        console.log('Seed tasks completato.');
      }
    });
  });
}

export function resetDb(callback) {
  db.serialize(() => {
    db.run('DELETE FROM tasks');
    db.run('DELETE FROM folders');
    db.run('DELETE FROM members');
    db.run('DELETE FROM categories');
    db.run('DELETE FROM projects');
    db.run('DELETE FROM stato');

    const stmtM = db.prepare('INSERT INTO members (id, name, email, role, color) VALUES (?, ?, ?, ?, ?)');
    initialMembers.forEach((m) => stmtM.run(m.id, m.name, m.email, m.role, m.color));
    stmtM.finalize();

    const stmtF = db.prepare('INSERT INTO folders (id, name, color) VALUES (?, ?, ?)');
    initialFolders.forEach((f) => stmtF.run(f.id, f.name, f.color));
    stmtF.finalize();

    const stmtT = db.prepare('INSERT INTO tasks (id, title, description, status, priority, assigneeId, folderId, dueDate, tags, createdAt, updatedAt, categoryId, projectId, favorite, archived, estimatedTime, reminderDate, repeatType, repeatEvery, repeatEnd, repeatDays) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    initialTasks.forEach((t) => {
      stmtT.run(t.id, t.title, t.description, t.status, t.priority, t.assigneeId, t.folderId, t.dueDate, t.tags, t.createdAt, t.updatedAt, t.categoryId, t.projectId, t.favorite, t.archived, t.estimatedTime, t.reminderDate, t.repeatType, t.repeatEvery, t.repeatEnd, t.repeatDays);
    });
    stmtT.finalize();

    if (callback) callback();
  });
}

export default db;
