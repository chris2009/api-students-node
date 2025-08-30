// server.js
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import { initDb } from './db.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

let db;

// Rutas
app.get('/students', async (req, res) => {
  try {
    const rows = await db.all(
      'SELECT id, firstname, lastname, gender, age FROM students'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', detail: e.message });
  }
});

app.post('/students', async (req, res) => {
  try {
    const { firstname, lastname, gender, age } = req.body || {};
    if (!firstname || !lastname || !gender) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        detail: 'firstname, lastname y gender son requeridos'
      });
    }
    const result = await db.run(
      'INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)',
      [firstname, lastname, gender, age ?? null]
    );
    res.status(201).json({
      id: result.lastID,
      firstname,
      lastname,
      gender,
      age: age ?? null
    });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', detail: e.message });
  }
});

app.get('/student/:id', async (req, res) => {
  try {
    const row = await db.get(
      'SELECT id, firstname, lastname, gender, age FROM students WHERE id = ?',
      [req.params.id]
    );
    if (!row) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', detail: e.message });
  }
});

app.put('/student/:id', async (req, res) => {
  try {
    const { firstname, lastname, gender, age } = req.body || {};
    if (!firstname || !lastname || !gender) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        detail: 'firstname, lastname y gender son requeridos'
      });
    }
    const result = await db.run(
      'UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?',
      [firstname, lastname, gender, age ?? null, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'NOT_FOUND' });

    const updated = await db.get(
      'SELECT id, firstname, lastname, gender, age FROM students WHERE id = ?',
      [req.params.id]
    );
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', detail: e.message });
  }
});

app.delete('/student/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json({ message: `Student ${req.params.id} eliminado` });
  } catch (e) {
    res.status(500).json({ error: 'DB_ERROR', detail: e.message });
  }
});

// Arranque
(async () => {
  db = await initDb();
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API escuchando en http://0.0.0.0:${PORT}`);
  });
})();