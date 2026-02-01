const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sql = neon(process.env.DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'attendease-secret-key';

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

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
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
    // AUTH: Login
    if (path === '/auth/login' && req.method === 'POST') {
      const { username, password } = await parseBody(req);
      const users = await sql`SELECT * FROM users WHERE username = ${username}`;
      
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
      
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      return res.end(JSON.stringify({ token, user: { id: user.id, username: user.username, role: user.role } }));
    }

    // Protected routes - verify token
    const user = verifyToken(req);
    if (!user && !path.startsWith('/auth')) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    // STUDENTS: Get all
    if (path === '/students' && req.method === 'GET') {
      const students = await sql`SELECT * FROM students ORDER BY name`;
      return res.end(JSON.stringify(students));
    }

    // STUDENTS: Get by ID
    if (path.match(/^\/students\/\d+$/) && req.method === 'GET') {
      const id = path.split('/')[2];
      const students = await sql`SELECT * FROM students WHERE id = ${id}`;
      return res.end(JSON.stringify(students[0] || null));
    }

    // COURSES: Get all
    if (path === '/courses' && req.method === 'GET') {
      const courses = await sql`SELECT * FROM courses ORDER BY name`;
      return res.end(JSON.stringify(courses));
    }

    // ATTENDANCE: Get by course and date
    if (path === '/attendance' && req.method === 'GET') {
      const courseId = url.searchParams.get('courseId');
      const date = url.searchParams.get('date');
      
      if (courseId && date) {
        const records = await sql`
          SELECT a.*, s.name as student_name, s.roll_number 
          FROM attendance a 
          JOIN students s ON a.student_id = s.id 
          WHERE a.course_id = ${courseId} AND a.date = ${date}
        `;
        return res.end(JSON.stringify(records));
      }
      
      const records = await sql`SELECT * FROM attendance ORDER BY date DESC LIMIT 100`;
      return res.end(JSON.stringify(records));
    }

    // ATTENDANCE: Mark attendance
    if (path === '/attendance' && req.method === 'POST') {
      const { studentId, courseId, date, status } = await parseBody(req);
      
      // Upsert attendance
      await sql`
        INSERT INTO attendance (student_id, course_id, date, status, marked_by)
        VALUES (${studentId}, ${courseId}, ${date}, ${status}, ${user.id})
        ON CONFLICT (student_id, course_id, date) 
        DO UPDATE SET status = ${status}, marked_by = ${user.id}
      `;
      
      return res.end(JSON.stringify({ success: true }));
    }

    // ATTENDANCE: Bulk mark
    if (path === '/attendance/bulk' && req.method === 'POST') {
      const { courseId, date, records } = await parseBody(req);
      
      for (const record of records) {
        await sql`
          INSERT INTO attendance (student_id, course_id, date, status, marked_by)
          VALUES (${record.studentId}, ${courseId}, ${date}, ${record.status}, ${user.id})
          ON CONFLICT (student_id, course_id, date) 
          DO UPDATE SET status = ${record.status}, marked_by = ${user.id}
        `;
      }
      
      return res.end(JSON.stringify({ success: true, count: records.length }));
    }

    // STATS: Dashboard stats
    if (path === '/stats' && req.method === 'GET') {
      const [studentCount] = await sql`SELECT COUNT(*) as count FROM students`;
      const [courseCount] = await sql`SELECT COUNT(*) as count FROM courses`;
      const [todayAttendance] = await sql`SELECT COUNT(*) as count FROM attendance WHERE date = CURRENT_DATE`;
      
      return res.end(JSON.stringify({
        totalStudents: parseInt(studentCount.count),
        totalCourses: parseInt(courseCount.count),
        todayAttendance: parseInt(todayAttendance.count)
      }));
    }

    // 404 Not Found
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('API Error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
