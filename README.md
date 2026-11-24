# П5 — Список завдань (Node.js + Express + PostgreSQL)

Власний REST API на Express, дані зберігаються в PostgreSQL (таблиця `tasks`), фронтенд у папці `public` роздає той самий сервер.

## Запуск

1. Потрібні Node.js 20.6+ і PostgreSQL.
2. Створіть базу:
   ```
   psql -U postgres -c "CREATE DATABASE todo;"
   ```
3. Скопіюйте `.env.example` у `.env` і вкажіть свій пароль від PostgreSQL.
4. Встановіть залежності та запустіть:
   ```
   npm install
   npm start
   ```
5. Відкрийте http://localhost:3000

Таблиця `tasks` створюється автоматично під час першого запуску.

## API

| Метод  | Маршрут          | Опис                                   |
|--------|------------------|----------------------------------------|
| GET    | /api/tasks       | список завдань                         |
| POST   | /api/tasks       | додати завдання, тіло `{ "title": "…" }` |
| PUT    | /api/tasks/:id   | (бонус) змінити `title` та/або `done`  |
| DELETE | /api/tasks/:id   | видалити завдання                      |

## Структура

```
server.js        — Express, маршрути API, роздача public/
db.js            — підключення до PostgreSQL, створення таблиці
public/          — index.html, style.css, app.js (fetch до API)
.env.example     — приклад налаштувань підключення
```

Бонус: редагування (кнопка ✎ або подвійний клік), позначка «виконано», фільтри «Усі / Активні / Виконані».
