# AttendEase Web

A modern web-based attendance management system built with Spring Boot and React.

## Project Structure

```
AttendEase-Web/
├── backend/          # Spring Boot REST API
│   ├── src/
│   │   └── main/
│   │       ├── java/com/attendease/
│   │       │   ├── controller/     # REST Controllers
│   │       │   ├── model/          # JPA Entities
│   │       │   ├── repository/     # Spring Data Repositories
│   │       │   ├── service/        # Business Logic
│   │       │   ├── security/       # JWT Authentication
│   │       │   ├── config/         # Spring Configuration
│   │       │   └── dto/            # Data Transfer Objects
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
└── frontend/         # React + TypeScript + Vite
    ├── src/
    │   ├── components/    # Reusable UI Components
    │   ├── pages/         # Page Components
    │   ├── context/       # React Context (Auth)
    │   └── services/      # API Service
    └── package.json
```

## Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Security** with JWT Authentication
- **Spring Data JPA** with PostgreSQL
- **Lombok** for boilerplate reduction

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development
- **TailwindCSS** for styling
- **React Query** for data fetching
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

## Getting Started

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
