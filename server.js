// ============================================================
// Online Course Enrollment System — Backend
// Tech: Node.js + Express + SQLite (better-sqlite3)
// ============================================================
const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));
// Let the server read JSON bodies sent by the form
app.use(express.json());

// ---------------- Database setup ----------------
// Creates enrollments.db automatically on first run.
const db = new Database('enrollments.db');
db.prepare(`
  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    course TEXT NOT NULL,
    batch TEXT NOT NULL,
    message TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`).run();

// ---------------- API Routes ----------------

// GET /api/enrollments — list enrollments
// Optional filters: ?course=Python%20Programming&search=nabeel
app.get('/api/enrollments', (req, res) => {
  const { course, search } = req.query;
  let rows = db.prepare('SELECT * FROM enrollments ORDER BY id DESC').all();

  if (course) {
    rows = rows.filter((r) => r.course === course);
  }
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
    );
  }
  res.json(rows);
});

// GET /api/stats — total enrollments + per-course counts
app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS c FROM enrollments').get().c;
  const byCourse = db
    .prepare('SELECT course, COUNT(*) AS c FROM enrollments GROUP BY course')
    .all();
  res.json({ total, byCourse });
});

// POST /api/enroll — create a new enrollment
app.post('/api/enroll', (req, res) => {
  const { fullName, email, phone, course, batch, message } = req.body;

  // Backend validation (never trust the frontend alone)
  if (!fullName || !email || !phone || !course || !batch) {
    return res.status(400).json({ error: 'Please fill all required fields.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const result = db
      .prepare(
        'INSERT INTO enrollments (fullName, email, phone, course, batch, message) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(fullName, email, phone, course, batch, message || '');

    const row = db
      .prepare('SELECT * FROM enrollments WHERE id = ?')
      .get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) {
    // One email = one enrollment
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'This email is already enrolled.' });
    }
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// DELETE /api/enrollments/:id — remove an enrollment
app.delete('/api/enrollments/:id', (req, res) => {
  const result = db
    .prepare('DELETE FROM enrollments WHERE id = ?')
    .run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Enrollment not found.' });
  }
  res.json({ success: true });
});

// ---------------- Start the server ----------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
