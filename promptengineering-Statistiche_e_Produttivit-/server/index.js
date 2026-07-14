import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb, resetDb } from './config/db.js';
import { getMembers, createMember, updateMember, deleteMember } from './controllers/membersController.js';
import { getFolders, createFolder, updateFolder, deleteFolder } from './controllers/foldersController.js';
import { getTasks, createTask, updateTask, deleteTask } from './controllers/tasksController.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from './controllers/categoriesController.js';
import { getProjects, createProject, updateProject, deleteProject } from './controllers/projectsController.js';
import { addStatus, getStatus } from './controllers/statusController.js';
import { getGoals, createGoal, updateGoal, deleteGoal } from './controllers/goalsController.js';
import { getAttachments, uploadAttachment, deleteAttachment } from './controllers/attachmentsController.js';
import { getNotifications, markAsRead, deleteNotification } from './controllers/notificationsController.js';
import { register, login, googleLogin, forgotPassword, resetPassword, me } from './controllers/authController.js';
import { authenticateToken } from './middleware/auth.js';
import './scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Setup Multer for file uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadsDir));

// Inizializza il DB
initDb();

// Auth Routes (Pubbliche)
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/google', googleLogin);
app.post('/api/auth/forgot-password', forgotPassword);
app.post('/api/auth/reset-password', resetPassword);

// Endpoint di Reset
app.post('/api/reset', authenticateToken, (req, res) => {
  resetDb(() => {
    res.json({ message: 'Database ripristinato con successo' });
  });
});

// Tutte le route seguenti sono protette dal middleware
app.use('/api', authenticateToken);

// Utente Corrente
app.get('/api/auth/me', me);

// Membri
app.get('/api/members', getMembers);
app.post('/api/members', createMember);
app.put('/api/members/:id', updateMember);
app.delete('/api/members/:id', deleteMember);

// Cartelle
app.get('/api/folders', getFolders);
app.post('/api/folders', createFolder);
app.put('/api/folders/:id', updateFolder);
app.delete('/api/folders/:id', deleteFolder);

// Task
app.get('/api/tasks', getTasks);
app.post('/api/tasks', createTask);
app.put('/api/tasks/:id', updateTask);
app.delete('/api/tasks/:id', deleteTask);

// Categorie
app.get('/api/categories', getCategories);
app.post('/api/categories', createCategory);
app.put('/api/categories/:id', updateCategory);
app.delete('/api/categories/:id', deleteCategory);

// Progetti
app.get('/api/projects', getProjects);
app.post('/api/projects', createProject);
app.put('/api/projects/:id', updateProject);
app.delete('/api/projects/:id', deleteProject);

// Stato
app.get('/api/status', getStatus);
app.post('/api/add_status', addStatus);

// Goals
app.get('/api/goals', getGoals);
app.post('/api/goals', createGoal);
app.put('/api/goals/:id', updateGoal);
app.delete('/api/goals/:id', deleteGoal);

// Attachments
app.get('/api/attachments/:taskId', getAttachments);
app.post('/api/attachments', upload.single('file'), uploadAttachment);
app.delete('/api/attachments/:id', deleteAttachment);

// Notifications
app.get('/api/notifications', getNotifications);
app.put('/api/notifications/:id/read', markAsRead);
app.delete('/api/notifications/:id', deleteNotification);

app.listen(PORT, () => {
  console.log(`Server Express (strutturato) in esecuzione sulla porta ${PORT}`);
});
