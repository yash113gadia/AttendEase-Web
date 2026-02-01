const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sql = neon(process.env.DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'attendease-secret-key';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Helper to parse JSON body
const parseBody = async (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } 
      catch { resolve({}); }
    });
  });
};

// Verify JWT token
const verifyToken = (req) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET);
  } catch { return null; }
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace('/api', '');
  
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  try {
    // ==================== AUTH ====================
    if (path === '/auth/login' && req.method === 'POST') {
      const { username, password } = await parseBody(req);
      const users = await sql`SELECT * FROM users WHERE LOWER(username) = LOWER(${username})`;
      
      if (users.length === 0) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Invalid credentials' }));
      }
      
      const user = users[0];
      const valid = await bcrypt.compare(password, user.password);
      
      if (!valid) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Invalid credentials' }));
      }
      
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, fullName: user.full_name }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      return res.end(JSON.stringify({ 
        token, 
        user: { id: user.id, username: user.username, role: user.role, fullName: user.full_name } 
      }));
    }

    // Protected routes - verify token
    const user = verifyToken(req);
    if (!user && !path.startsWith('/auth')) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    // ==================== DASHBOARD STATS ====================
    if (path === '/stats' && req.method === 'GET') {
      const [studentCount] = await sql`SELECT COUNT(*) as count FROM students`;
      const [courseCount] = await sql`SELECT COUNT(*) as count FROM courses`;
      const [subjectCount] = await sql`SELECT COUNT(*) as count FROM subjects`;
      const [todayAttendance] = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'present') as present,
          COUNT(*) as total
        FROM attendance WHERE date = CURRENT_DATE
      `;
      
      // Calculate average attendance
      const avgResult = await sql`
        SELECT 
          ROUND(
            COUNT(*) FILTER (WHERE status = 'present')::numeric / 
            NULLIF(COUNT(*)::numeric, 0) * 100, 
            1
          ) as avg_attendance
        FROM attendance
      `;
      
      // Low attendance students (< 75%)
      const lowAttendance = await sql`
        SELECT s.id, s.name, s.roll_number,
          ROUND(
            COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
            NULLIF(COUNT(a.id)::numeric, 0) * 100, 
            1
          ) as percentage
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id
        GROUP BY s.id, s.name, s.roll_number
        HAVING COUNT(a.id) > 0 AND 
          COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
          NULLIF(COUNT(a.id)::numeric, 0) * 100 < 75
        ORDER BY percentage ASC
        LIMIT 5
      `;

      return res.end(JSON.stringify({
        totalStudents: parseInt(studentCount.count),
        totalCourses: parseInt(courseCount.count),
        totalSubjects: parseInt(subjectCount.count),
        todayPresent: parseInt(todayAttendance.present || 0),
        todayTotal: parseInt(todayAttendance.total || 0),
        avgAttendance: parseFloat(avgResult[0]?.avg_attendance || 0),
        lowAttendanceStudents: lowAttendance
      }));
    }

    // ==================== STUDENTS ====================
    if (path === '/students' && req.method === 'GET') {
      const courseId = url.searchParams.get('courseId');
      const search = url.searchParams.get('search');
      let students;
      
      if (search) {
        students = await sql`
          SELECT s.*, c.name as course_name, c.code as course_code,
            COALESCE(
              ROUND(
                COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
                NULLIF(COUNT(a.id)::numeric, 0) * 100, 
                1
              ), 0
            ) as attendance_percentage
          FROM students s
          LEFT JOIN courses c ON s.course_id = c.id
          LEFT JOIN attendance a ON s.id = a.student_id
          WHERE LOWER(s.name) LIKE LOWER(${'%' + search + '%'}) 
             OR LOWER(s.roll_number) LIKE LOWER(${'%' + search + '%'})
          GROUP BY s.id, c.name, c.code
          ORDER BY s.roll_number
        `;
      } else if (courseId && courseId !== 'all') {
        students = await sql`
          SELECT s.*, c.name as course_name, c.code as course_code,
            COALESCE(
              ROUND(
                COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
                NULLIF(COUNT(a.id)::numeric, 0) * 100, 
                1
              ), 0
            ) as attendance_percentage
          FROM students s
          LEFT JOIN courses c ON s.course_id = c.id
          LEFT JOIN attendance a ON s.id = a.student_id
          WHERE s.course_id = ${courseId}
          GROUP BY s.id, c.name, c.code
          ORDER BY s.roll_number
        `;
      } else {
        students = await sql`
          SELECT s.*, c.name as course_name, c.code as course_code,
            COALESCE(
              ROUND(
                COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
                NULLIF(COUNT(a.id)::numeric, 0) * 100, 
                1
              ), 0
            ) as attendance_percentage
          FROM students s
          LEFT JOIN courses c ON s.course_id = c.id
          LEFT JOIN attendance a ON s.id = a.student_id
          GROUP BY s.id, c.name, c.code
          ORDER BY s.roll_number
        `;
      }
      return res.end(JSON.stringify(students));
    }

    if (path === '/students' && req.method === 'POST') {
      if (user.role !== 'admin') {
        res.statusCode = 403;
        return res.end(JSON.stringify({ error: 'Admin only' }));
      }
      
      const { rollNumber, name, email, courseId } = await parseBody(req);
      
      const result = await sql`
        INSERT INTO students (roll_number, name, email, course_id)
        VALUES (${rollNumber}, ${name}, ${email || ''}, ${courseId})
        RETURNING *
      `;
      return res.end(JSON.stringify(result[0]));
    }

    if (path.match(/^\/students\/\d+$/) && req.method === 'DELETE') {
      if (user.role !== 'admin') {
        res.statusCode = 403;
        return res.end(JSON.stringify({ error: 'Admin only' }));
      }
      
      const id = path.split('/')[2];
      await sql`DELETE FROM attendance WHERE student_id = ${id}`;
      await sql`DELETE FROM students WHERE id = ${id}`;
      return res.end(JSON.stringify({ success: true }));
    }

    if (path === '/students/import' && req.method === 'POST') {
      if (user.role !== 'admin') {
        res.statusCode = 403;
        return res.end(JSON.stringify({ error: 'Admin only' }));
      }
      
      const { students } = await parseBody(req);
      let imported = 0;
      
      for (const s of students) {
        try {
          await sql`
            INSERT INTO students (roll_number, name, email, course_id)
            VALUES (${s.rollNumber}, ${s.name}, ${s.email || ''}, ${s.courseId})
            ON CONFLICT (roll_number) DO NOTHING
          `;
          imported++;
        } catch (e) { /* skip duplicates */ }
      }
      
      return res.end(JSON.stringify({ success: true, imported }));
    }

    // ==================== COURSES ====================
    if (path === '/courses' && req.method === 'GET') {
      const courses = await sql`
        SELECT c.*, COUNT(s.id) as student_count
        FROM courses c
        LEFT JOIN students s ON c.id = s.course_id
        GROUP BY c.id
        ORDER BY c.name
      `;
      return res.end(JSON.stringify(courses));
    }

    // ==================== SUBJECTS ====================
    if (path === '/subjects' && req.method === 'GET') {
      const courseId = url.searchParams.get('courseId');
      let subjects;
      
      if (courseId) {
        subjects = await sql`
          SELECT s.*, c.name as course_name, u.full_name as teacher_name
          FROM subjects s
          LEFT JOIN courses c ON s.course_id = c.id
          LEFT JOIN users u ON s.teacher_id = u.id
          WHERE s.course_id = ${courseId}
          ORDER BY s.name
        `;
      } else {
        subjects = await sql`
          SELECT s.*, c.name as course_name, u.full_name as teacher_name
          FROM subjects s
          LEFT JOIN courses c ON s.course_id = c.id
          LEFT JOIN users u ON s.teacher_id = u.id
          ORDER BY s.name
        `;
      }
      return res.end(JSON.stringify(subjects));
    }

    // ==================== TIMETABLE ====================
    if (path === '/timetable' && req.method === 'GET') {
      const day = url.searchParams.get('day');
      const courseId = url.searchParams.get('courseId');
      
      let sessions;
      if (day && courseId) {
        sessions = await sql`
          SELECT ss.*, sub.name as subject_name, sub.code as subject_code,
                 u.full_name as teacher_name, c.name as course_name
          FROM sessions ss
          JOIN subjects sub ON ss.subject_id = sub.id
          JOIN users u ON sub.teacher_id = u.id
          JOIN courses c ON sub.course_id = c.id
          WHERE ss.day_of_week = ${day} AND sub.course_id = ${courseId}
          ORDER BY ss.start_time
        `;
      } else if (day) {
        sessions = await sql`
          SELECT ss.*, sub.name as subject_name, sub.code as subject_code,
                 u.full_name as teacher_name, c.name as course_name
          FROM sessions ss
          JOIN subjects sub ON ss.subject_id = sub.id
          JOIN users u ON sub.teacher_id = u.id
          JOIN courses c ON sub.course_id = c.id
          WHERE ss.day_of_week = ${day}
          ORDER BY ss.start_time
        `;
      } else if (courseId) {
        sessions = await sql`
          SELECT ss.*, sub.name as subject_name, sub.code as subject_code,
                 u.full_name as teacher_name, c.name as course_name
          FROM sessions ss
          JOIN subjects sub ON ss.subject_id = sub.id
          JOIN users u ON sub.teacher_id = u.id
          JOIN courses c ON sub.course_id = c.id
          WHERE sub.course_id = ${courseId}
          ORDER BY 
            CASE ss.day_of_week 
              WHEN 'MON' THEN 1 WHEN 'TUE' THEN 2 WHEN 'WED' THEN 3
              WHEN 'THU' THEN 4 WHEN 'FRI' THEN 5 WHEN 'SAT' THEN 6
              ELSE 7 
            END,
            ss.start_time
        `;
      } else {
        sessions = await sql`
          SELECT ss.*, sub.name as subject_name, sub.code as subject_code,
                 u.full_name as teacher_name, c.name as course_name
          FROM sessions ss
          JOIN subjects sub ON ss.subject_id = sub.id
          JOIN users u ON sub.teacher_id = u.id
          JOIN courses c ON sub.course_id = c.id
          ORDER BY 
            CASE ss.day_of_week 
              WHEN 'MON' THEN 1 WHEN 'TUE' THEN 2 WHEN 'WED' THEN 3
              WHEN 'THU' THEN 4 WHEN 'FRI' THEN 5 WHEN 'SAT' THEN 6
              ELSE 7 
            END,
            ss.start_time
        `;
      }
      return res.end(JSON.stringify(sessions));
    }

    // ==================== ATTENDANCE ====================
    if (path === '/attendance' && req.method === 'GET') {
      const sessionId = url.searchParams.get('sessionId');
      const date = url.searchParams.get('date');
      const studentId = url.searchParams.get('studentId');
      
      if (studentId) {
        // Get attendance history for a student
        const records = await sql`
          SELECT a.*, ss.day_of_week, sub.name as subject_name, sub.code as subject_code
          FROM attendance a
          JOIN sessions ss ON a.session_id = ss.id
          JOIN subjects sub ON ss.subject_id = sub.id
          WHERE a.student_id = ${studentId}
          ORDER BY a.date DESC, ss.start_time
          LIMIT 50
        `;
        return res.end(JSON.stringify(records));
      }
      
      if (sessionId && date) {
        // Get attendance for a specific session and date
        const records = await sql`
          SELECT a.*, s.name as student_name, s.roll_number
          FROM attendance a
          JOIN students s ON a.student_id = s.id
          WHERE a.session_id = ${sessionId} AND a.date = ${date}
          ORDER BY s.roll_number
        `;
        return res.end(JSON.stringify(records));
      }
      
      // Default: recent attendance
      const records = await sql`
        SELECT a.*, s.name as student_name, s.roll_number, 
               sub.name as subject_name, ss.day_of_week
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN sessions ss ON a.session_id = ss.id
        JOIN subjects sub ON ss.subject_id = sub.id
        ORDER BY a.date DESC, a.created_at DESC
        LIMIT 100
      `;
      return res.end(JSON.stringify(records));
    }

    if (path === '/attendance/mark' && req.method === 'POST') {
      const { sessionId, date, records } = await parseBody(req);
      
      for (const record of records) {
        await sql`
          INSERT INTO attendance (student_id, session_id, date, status, marked_by, remarks)
          VALUES (${record.studentId}, ${sessionId}, ${date}, ${record.status}, ${user.id}, ${record.remarks || ''})
          ON CONFLICT (student_id, session_id, date) 
          DO UPDATE SET status = ${record.status}, marked_by = ${user.id}, remarks = ${record.remarks || ''}
        `;
      }
      
      return res.end(JSON.stringify({ success: true, count: records.length }));
    }

    if (path === '/attendance/session-students' && req.method === 'GET') {
      const sessionId = url.searchParams.get('sessionId');
      const date = url.searchParams.get('date');
      
      // Get all students for the course that this session belongs to
      const students = await sql`
        SELECT DISTINCT s.id, s.name, s.roll_number,
               a.status as attendance_status, a.remarks
        FROM students s
        JOIN subjects sub ON s.course_id = sub.course_id
        JOIN sessions ss ON ss.subject_id = sub.id
        LEFT JOIN attendance a ON s.id = a.student_id AND a.session_id = ${sessionId} AND a.date = ${date}
        WHERE ss.id = ${sessionId}
        ORDER BY s.roll_number
      `;
      return res.end(JSON.stringify(students));
    }

    // ==================== REPORTS ====================
    if (path === '/reports/low-attendance' && req.method === 'GET') {
      const threshold = url.searchParams.get('threshold') || 75;
      
      const students = await sql`
        SELECT s.id, s.name, s.roll_number, c.name as course_name,
          COUNT(a.id) as total_classes,
          COUNT(*) FILTER (WHERE a.status = 'present') as present_count,
          ROUND(
            COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
            NULLIF(COUNT(a.id)::numeric, 0) * 100, 
            1
          ) as percentage
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN attendance a ON s.id = a.student_id
        GROUP BY s.id, s.name, s.roll_number, c.name
        HAVING COUNT(a.id) > 0 AND 
          COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
          NULLIF(COUNT(a.id)::numeric, 0) * 100 < ${threshold}
        ORDER BY percentage ASC
      `;
      return res.end(JSON.stringify(students));
    }

    if (path === '/reports/attendance-summary' && req.method === 'GET') {
      const courseId = url.searchParams.get('courseId');
      
      let summary;
      if (courseId) {
        summary = await sql`
          SELECT 
            DATE_TRUNC('day', a.date) as date,
            COUNT(*) FILTER (WHERE a.status = 'present') as present,
            COUNT(*) FILTER (WHERE a.status = 'absent') as absent,
            COUNT(*) as total
          FROM attendance a
          JOIN students s ON a.student_id = s.id
          WHERE s.course_id = ${courseId}
          GROUP BY DATE_TRUNC('day', a.date)
          ORDER BY date DESC
          LIMIT 30
        `;
      } else {
        summary = await sql`
          SELECT 
            DATE_TRUNC('day', a.date) as date,
            COUNT(*) FILTER (WHERE a.status = 'present') as present,
            COUNT(*) FILTER (WHERE a.status = 'absent') as absent,
            COUNT(*) as total
          FROM attendance a
          GROUP BY DATE_TRUNC('day', a.date)
          ORDER BY date DESC
          LIMIT 30
        `;
      }
      return res.end(JSON.stringify(summary));
    }

    if (path === '/reports/student-stats' && req.method === 'GET') {
      const studentId = url.searchParams.get('studentId');
      
      if (!studentId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'studentId required' }));
      }
      
      const [student] = await sql`
        SELECT s.*, c.name as course_name
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        WHERE s.id = ${studentId}
      `;
      
      const stats = await sql`
        SELECT 
          sub.name as subject_name,
          COUNT(a.id) as total_classes,
          COUNT(*) FILTER (WHERE a.status = 'present') as present,
          ROUND(
            COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
            NULLIF(COUNT(a.id)::numeric, 0) * 100, 
            1
          ) as percentage
        FROM subjects sub
        JOIN sessions ss ON ss.subject_id = sub.id
        LEFT JOIN attendance a ON a.session_id = ss.id AND a.student_id = ${studentId}
        WHERE sub.course_id = ${student.course_id}
        GROUP BY sub.id, sub.name
        ORDER BY sub.name
      `;
      
      return res.end(JSON.stringify({ student, subjectStats: stats }));
    }

    // 404 Not Found
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Not found', path }));

  } catch (error) {
    console.error('API Error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
  }
};
