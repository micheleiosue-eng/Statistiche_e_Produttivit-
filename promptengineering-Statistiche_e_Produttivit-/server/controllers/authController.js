import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export const register = (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  // Check if user exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(409).json({ error: 'Email già registrata' });

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.run(
      'INSERT INTO users (id, firstName, lastName, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, firstName, lastName, email, hashedPassword, now, now],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        
        const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ 
          message: 'Utente registrato con successo',
          token,
          user: { id, firstName, lastName, email }
        });
      }
    );
  });
};

export const login = (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatori' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Credenziali non valide' });

    if (user.provider !== 'local' && !user.password) {
       return res.status(401).json({ error: 'Questo account utilizza un altro metodo di accesso (es. Google)' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Credenziali non valide' });

    const expiresIn = rememberMe ? '30d' : '1d';
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn });

    res.json({
      message: 'Accesso effettuato con successo',
      token,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }
    });
  });
};

export const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Token Google mancante' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const expiresIn = '7d';
      
      if (user) {
        // Login
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn });
        return res.json({
          token,
          user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }
        });
      } else {
        // Register
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        db.run(
          'INSERT INTO users (id, firstName, lastName, email, provider, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, given_name || '', family_name || '', email, 'google', now, now],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn });
            return res.status(201).json({
              token,
              user: { id, firstName: given_name, lastName: family_name, email }
            });
          }
        );
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Autenticazione Google fallita' });
  }
};

export const forgotPassword = (req, res) => {
  const { email } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    // Don't reveal if user exists or not for security
    if (!user) return res.json({ message: 'Se l\'email esiste, riceverai un link per il reset' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    db.run(
      'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?',
      [hashedToken, expiry, user.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Simula invio email
        console.log('====================================');
        console.log(`SIMULAZIONE EMAIL PER: ${email}`);
        console.log(`Link di reset: http://localhost:5173/reset-password?token=${resetToken}`);
        console.log('====================================');

        res.json({ message: 'Se l\'email esiste, riceverai un link per il reset' });
      }
    );
  });
};

export const resetPassword = (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token e nuova password richiesti' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date().toISOString();

  db.get(
    'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?',
    [hashedToken, now],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(400).json({ error: 'Token non valido o scaduto' });

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      db.run(
        'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL, updatedAt = ? WHERE id = ?',
        [hashedPassword, now, user.id],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Password aggiornata con successo' });
        }
      );
    }
  );
};

export const me = (req, res) => {
  db.get('SELECT id, firstName, lastName, email, provider, createdAt FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    res.json(user);
  });
};
