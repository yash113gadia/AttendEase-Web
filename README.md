<div align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

# 📚 AttendEase Web

> A modern, full-stack attendance management system for educational institutions

<div align="center">
  <img src="https://img.shields.io/badge/Status-Live-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time attendance statistics and analytics |
| 👥 **Student Management** | Add, edit, and manage student records |
| 📅 **Course Management** | Create and organize courses with sessions |
| ✅ **Attendance Tracking** | Mark and track attendance with ease |
| 🔐 **Authentication** | Secure JWT-based login system |
| 📱 **Responsive Design** | Works seamlessly on desktop and mobile |

---

## 🖼️ Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Dashboard</strong></td>
      <td align="center"><strong>Login</strong></td>
    </tr>
    <tr>
      <td><img src="docs/dashboard.png" width="400" alt="Dashboard"/></td>
      <td><img src="docs/login.png" width="400" alt="Login"/></td>
    </tr>
  </table>
</div>

---

## 🛠️ Tech Stack

<table>
<tr>
<td>

### Frontend
- ⚛️ **React 18** with Hooks
- 📘 **TypeScript** for type safety
- ⚡ **Vite** for blazing fast builds
- 🎨 **TailwindCSS** for styling
- 🔄 **React Router** for navigation
- 📡 **Axios** for API calls
- 💎 **Lucide React** icons

</td>
<td>

### Backend
- 🟢 **Node.js** serverless functions
- 🐘 **PostgreSQL** (Neon) database
- 🔑 **JWT** authentication
- ☁️ **Vercel** deployment

</td>
</tr>
</table>

---

## 📁 Project Structure

```
AttendEase-Web/
├── 📂 api/               # Serverless API functions
│   ├── auth.js           # Authentication endpoints
│   ├── students.js       # Student CRUD operations
│   ├── courses.js        # Course management
│   ├── attendance.js     # Attendance tracking
│   └── dashboard.js      # Dashboard statistics
│
├── 📂 frontend/          # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context (Auth)
│   │   └── services/     # API service layer
│   └── package.json
│
└── vercel.json           # Vercel configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL database
- Maven

### Backend Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE attendease;
```

2. Update database credentials in `backend/src/main/resources/application.properties`

3. Run the backend:
```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env` file (optional):
```
VITE_API_URL=http://localhost:8080/api
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Students
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get student by ID
- `GET /api/students/course/{courseId}` - Get students by course
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/session/{sessionId}?date=YYYY-MM-DD` - Get session attendance
- `GET /api/attendance/student/{studentId}?startDate=&endDate=` - Get student attendance
- `GET /api/attendance/course/{courseId}/stats` - Get course attendance stats

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/{id}` - Get course by ID
- `POST /api/courses` - Create course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/course/{courseId}` - Get sessions by course
- `POST /api/sessions` - Create session
- `DELETE /api/sessions/{id}` - Delete session

## Deployment

### Backend (Railway/Render)
1. Push to GitHub
2. Connect repository to Railway/Render
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CORS_ORIGINS`

### Frontend (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Set environment variable:
   - `VITE_API_URL` = Your backend URL

## License

MIT
