const express = require('express');
const { pool, init } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/api/tasks', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/tasks', async (req, res, next) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title) return res.status(400).json({ error: 'Поле title обовʼязкове' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/tasks/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Некоректний id' });

  const { title, done } = req.body;
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'title не може бути порожнім' });
  }
  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({ error: 'done має бути true або false' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE tasks
         SET title = COALESCE($1, title),
             done  = COALESCE($2, done)
       WHERE id = $3
       RETURNING *`,
      [title?.trim() ?? null, done ?? null, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Завдання не знайдено' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Некоректний id' });

  try {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Завдання не знайдено' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Помилка сервера' });
});

init()
  .then(() => {
    app.listen(PORT, () => console.log(`Сервер запущено: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Не вдалося підключитися до бази данних:', err.message);
    process.exit(1);
  });
