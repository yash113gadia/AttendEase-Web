# AttendEase-Web

A full-stack attendance management system built for colleges. Handles student tracking, course management, and attendance reporting with role-based access for admins and teachers.

## Features

- **Dashboard** - Real-time attendance percentages and overview stats
- **Student Management** - CRUD operations, search, and CSV bulk import
- **Attendance Marking** - Multi-step flow: select course, pick session, mark students
- **Course Management** - Create and manage courses and subjects
- **Timetable View** - Weekly schedule display for sessions
- **Reports** - Low attendance alerts, attendance summaries, per-student stats
- **Auth** - JWT-based login (24hr expiry) with admin and teacher roles
- **Toast Notifications** - Feedback on all major actions

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- React Router DOM 7
- TanStack React Query 5
- Axios, Lucide Icons

**Backend**
- Node.js serverless functions (Vercel)
- Neon PostgreSQL (`@neondatabase/serverless`)
- JWT authentication, bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js >= 18
- A [Neon](https://neon.tech) PostgreSQL database

### Setup

```bash
git clone https://github.com/your-username/AttendEase-Web.git
cd AttendEase-Web
npm install
```

Create a `.env` file in the root:

```env
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_jwt_secret
```

Run the dev server:

```bash
npm run dev
```

### Deployment

The app is configured for Vercel. Push to your connected repo or run:

```bash
vercel --prod
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Admin and teacher accounts (email, hashed password, role) |
| `courses` | College courses |
| `subjects` | Subjects linked to courses |
| `students` | Student records tied to courses |
| `sessions` | Class sessions (date, subject, time slot) |
| `attendance` | Per-student attendance entries linked to sessions |

## License

MIT
