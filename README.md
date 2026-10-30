# 🎓 Online Course Enrollment System

A full-stack web application where students can enroll in online courses, and admins can view, search, filter, and manage enrollments.

Built as a college project.

## ✨ Features

- Student enrollment form with validation (frontend + backend)
- Duplicate email protection — one email, one enrollment
- Enrollment list with search and course filter
- Delete enrollments
- Live stats: total enrollments and per-course counts
- Data stored in SQLite — survives server restarts

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Fetch API)
- **Backend:** Node.js, Express
- **Database:** SQLite (via better-sqlite3)

## 🚀 How to Run

1. Install [Node.js](https://nodejs.org/) (v18 or newer)
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Open http://localhost:3000 in your browser

## 🔌 API Endpoints

| Method | Endpoint              | Description                                            |
| ------ | --------------------- | ------------------------------------------------------ |
| GET    | /api/enrollments      | List enrollments (supports `?course=` and `?search=`)  |
| GET    | /api/stats            | Total + per-course enrollment counts                   |
| POST   | /api/enroll           | Create a new enrollment                                |
| DELETE | /api/enrollments/:id  | Delete an enrollment                                   |

## 📁 Project Structure

```
server.js            # Express server + API + database
public/
  index.html         # Enrollment form + admin table
  style.css          # Styling
  app.js             # Frontend logic (Fetch API)
enrollments.db       # SQLite database (created automatically)
```

## 👨‍💻 Author

Nabeel Ullah Shareef — CSE student, Lords Institute of Engineering & Technology, Hyderabad
