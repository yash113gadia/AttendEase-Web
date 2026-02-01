const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_06RhJMfBxVdi@ep-super-violet-ahk0duq9.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function seed() {
  const sql = neon(DATABASE_URL);
  
  console.log('Dropping existing tables...');
  await sql`DROP TABLE IF EXISTS attendance CASCADE`;
  await sql`DROP TABLE IF EXISTS sessions CASCADE`;
  await sql`DROP TABLE IF EXISTS subjects CASCADE`;
  await sql`DROP TABLE IF EXISTS students CASCADE`;
  await sql`DROP TABLE IF EXISTS courses CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  
  console.log('Creating tables...');
  
  // Users table
  await sql`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      role VARCHAR(20) DEFAULT 'teacher',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  // Courses table
  await sql`
    CREATE TABLE courses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(20) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  // Subjects table
  await sql`
    CREATE TABLE subjects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(20) NOT NULL,
      course_id INTEGER REFERENCES courses(id),
      teacher_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  // Students table
  await sql`
    CREATE TABLE students (
      id SERIAL PRIMARY KEY,
      roll_number VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      course_id INTEGER REFERENCES courses(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  // Sessions (Timetable) table
  await sql`
    CREATE TABLE sessions (
      id SERIAL PRIMARY KEY,
      subject_id INTEGER REFERENCES subjects(id),
      day_of_week VARCHAR(3) NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      room VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  // Attendance table
  await sql`
    CREATE TABLE attendance (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id),
      session_id INTEGER REFERENCES sessions(id),
      date DATE NOT NULL,
      status VARCHAR(10) DEFAULT 'absent',
      marked_by INTEGER REFERENCES users(id),
      remarks TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(student_id, session_id, date)
    )
  `;
  
  console.log('Tables created!');
  
  // Seed users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPasswords = {
    shm: await bcrypt.hash('shm123', 10),
    rsb: await bcrypt.hash('rsb123', 10),
    drv: await bcrypt.hash('drv123', 10),
    rsp: await bcrypt.hash('rsp123', 10)
  };
  
  await sql`
    INSERT INTO users (username, password, full_name, role) VALUES
    ('admin', ${adminPassword}, 'Administrator', 'admin'),
    ('SHM', ${teacherPasswords.shm}, 'Prof. Sharma', 'teacher'),
    ('RSB', ${teacherPasswords.rsb}, 'Prof. Raghav', 'teacher'),
    ('DRV', ${teacherPasswords.drv}, 'Prof. Dev', 'teacher'),
    ('RSP', ${teacherPasswords.rsp}, 'Prof. Rajeev', 'teacher')
  `;
  console.log('Users seeded!');
  
  // Seed courses
  await sql`
    INSERT INTO courses (name, code, description) VALUES
    ('B.Tech Computer Science', 'BTCS', '4-year undergraduate program in Computer Science'),
    ('B.Tech AI & ML', 'BTAI', '4-year undergraduate program in AI and Machine Learning'),
    ('M.Tech Computer Science', 'MTCS', '2-year postgraduate program in Computer Science')
  `;
  console.log('Courses seeded!');
  
  // Get course IDs
  const courses = await sql`SELECT id, code FROM courses`;
  const btcs = courses.find(c => c.code === 'BTCS').id;
  const btai = courses.find(c => c.code === 'BTAI').id;
  
  // Get teacher IDs
  const teachers = await sql`SELECT id, username FROM users WHERE role = 'teacher'`;
  const shm = teachers.find(t => t.username === 'SHM').id;
  const rsb = teachers.find(t => t.username === 'RSB').id;
  const drv = teachers.find(t => t.username === 'DRV').id;
  const rsp = teachers.find(t => t.username === 'RSP').id;
  
  // Seed subjects
  await sql`
    INSERT INTO subjects (name, code, course_id, teacher_id) VALUES
    ('Data Structures', 'DSA-I', ${btcs}, ${shm}),
    ('DSA Lab', 'DSA-LAB', ${btcs}, ${shm}),
    ('Operating Systems', 'OS', ${btcs}, ${rsb}),
    ('OS Lab', 'OS-LAB', ${btcs}, ${rsb}),
    ('Artificial Intelligence', 'AI', ${btai}, ${rsp}),
    ('AI Lab', 'AI-LAB', ${btai}, ${rsp}),
    ('Advanced Computing', 'AIC', ${btai}, ${drv})
  `;
  console.log('Subjects seeded!');
  
  // Get subject IDs
  const subjects = await sql`SELECT id, code FROM subjects`;
  const dsa = subjects.find(s => s.code === 'DSA-I').id;
  const dsaLab = subjects.find(s => s.code === 'DSA-LAB').id;
  const os = subjects.find(s => s.code === 'OS').id;
  const ai = subjects.find(s => s.code === 'AI').id;
  
  // Seed timetable sessions
  await sql`
    INSERT INTO sessions (subject_id, day_of_week, start_time, end_time, room) VALUES
    (${dsa}, 'MON', '09:00', '10:00', 'Room 101'),
    (${os}, 'MON', '10:00', '11:00', 'Room 102'),
    (${ai}, 'MON', '11:00', '12:00', 'Room 103'),
    (${dsaLab}, 'TUE', '09:00', '11:00', 'Lab 1'),
    (${dsa}, 'WED', '09:00', '10:00', 'Room 101'),
    (${os}, 'WED', '10:00', '11:00', 'Room 102'),
    (${ai}, 'THU', '09:00', '10:00', 'Room 103'),
    (${dsa}, 'FRI', '09:00', '10:00', 'Room 101'),
    (${os}, 'FRI', '11:00', '12:00', 'Room 102')
  `;
  console.log('Timetable seeded!');
  
  // Seed students
  const studentData = [
    ['CS2024001', 'Aarav Sharma', 'aarav@student.edu', btcs],
    ['CS2024002', 'Priya Patel', 'priya@student.edu', btcs],
    ['CS2024003', 'Rahul Kumar', 'rahul@student.edu', btcs],
    ['CS2024004', 'Sneha Gupta', 'sneha@student.edu', btcs],
    ['CS2024005', 'Vikram Singh', 'vikram@student.edu', btcs],
    ['CS2024006', 'Ananya Reddy', 'ananya@student.edu', btcs],
    ['CS2024007', 'Arjun Nair', 'arjun@student.edu', btcs],
    ['CS2024008', 'Kavya Iyer', 'kavya@student.edu', btcs],
    ['CS2024009', 'Rohan Mehta', 'rohan@student.edu', btcs],
    ['CS2024010', 'Ishita Joshi', 'ishita@student.edu', btcs],
    ['AI2024001', 'Aditya Verma', 'aditya@student.edu', btai],
    ['AI2024002', 'Divya Kapoor', 'divya@student.edu', btai],
    ['AI2024003', 'Karan Malhotra', 'karan@student.edu', btai],
    ['AI2024004', 'Meera Krishnan', 'meera@student.edu', btai],
    ['AI2024005', 'Nikhil Saxena', 'nikhil@student.edu', btai]
  ];
  
  for (const [roll, name, email, courseId] of studentData) {
    await sql`
      INSERT INTO students (roll_number, name, email, course_id)
      VALUES (${roll}, ${name}, ${email}, ${courseId})
    `;
  }
  console.log('Students seeded!');
  
  // Seed some attendance records
  const allStudents = await sql`SELECT id FROM students`;
  const allSessions = await sql`SELECT id FROM sessions LIMIT 3`;
  const adminUser = await sql`SELECT id FROM users WHERE username = 'admin'`;
  
  for (const student of allStudents.slice(0, 10)) {
    for (const session of allSessions) {
      const status = Math.random() > 0.2 ? 'present' : 'absent';
      await sql`
        INSERT INTO attendance (student_id, session_id, date, status, marked_by)
        VALUES (${student.id}, ${session.id}, CURRENT_DATE, ${status}, ${adminUser[0].id})
        ON CONFLICT (student_id, session_id, date) DO NOTHING
      `;
    }
  }
  console.log('Sample attendance seeded!');
  
  console.log('\n✅ Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin: admin / admin123');
  console.log('  Teachers: SHM/shm123, RSB/rsb123, DRV/drv123, RSP/rsp123');
}

seed().catch(console.error);
