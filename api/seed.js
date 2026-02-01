const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_06RhJMfBxVdi@ep-super-violet-ahk0duq9.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function seed() {
  const sql = neon(DATABASE_URL);
  
  console.log('Creating tables...');
  
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'teacher',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(20) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      roll_number VARCHAR(20) UNIQUE NOT NULL,
      email VARCHAR(100),
      course_id INTEGER REFERENCES courses(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  await sql`
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id),
      course_id INTEGER REFERENCES courses(id),
      date DATE NOT NULL,
      status VARCHAR(10) DEFAULT 'absent',
      marked_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(student_id, course_id, date)
    )
  `;
  
  console.log('Tables created!');
  
  // Seed users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  
  await sql`
    INSERT INTO users (username, password, role) VALUES
    ('admin', ${adminPassword}, 'admin'),
    ('teacher', ${teacherPassword}, 'teacher')
    ON CONFLICT (username) DO NOTHING
  `;
  console.log('Users seeded: admin/admin123, teacher/teacher123');
  
  // Seed courses
  await sql`
    INSERT INTO courses (name, code, description) VALUES
    ('Data Structures', 'CS201', 'Introduction to data structures and algorithms'),
    ('Web Development', 'CS301', 'Full-stack web development with modern technologies'),
    ('Database Systems', 'CS202', 'Relational database design and SQL')
    ON CONFLICT (code) DO NOTHING
  `;
  console.log('Courses seeded!');
  
  // Seed students
  const students = [
    ['Aarav Sharma', 'CS2024001', 'aarav@student.edu'],
    ['Priya Patel', 'CS2024002', 'priya@student.edu'],
    ['Rahul Kumar', 'CS2024003', 'rahul@student.edu'],
    ['Sneha Gupta', 'CS2024004', 'sneha@student.edu'],
    ['Vikram Singh', 'CS2024005', 'vikram@student.edu'],
    ['Ananya Reddy', 'CS2024006', 'ananya@student.edu'],
    ['Arjun Nair', 'CS2024007', 'arjun@student.edu'],
    ['Kavya Iyer', 'CS2024008', 'kavya@student.edu'],
    ['Rohan Mehta', 'CS2024009', 'rohan@student.edu'],
    ['Ishita Joshi', 'CS2024010', 'ishita@student.edu']
  ];
  
  for (const [name, roll, email] of students) {
    await sql`
      INSERT INTO students (name, roll_number, email, course_id)
      VALUES (${name}, ${roll}, ${email}, 1)
      ON CONFLICT (roll_number) DO NOTHING
    `;
  }
  console.log('Students seeded!');
  
  console.log('\n✅ Database seeded successfully!');
  console.log('You can now login with:');
  console.log('  - admin / admin123');
  console.log('  - teacher / teacher123');
}

seed().catch(console.error);
