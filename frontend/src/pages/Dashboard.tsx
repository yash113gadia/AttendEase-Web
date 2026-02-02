import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Users, BookOpen, ClipboardCheck, TrendingDown, Calendar, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats {
  totalStudents: number;
  totalCourses: number;
  todayPresent: number;
  todayTotal: number;
  avgAttendance: number;
  lowAttendanceStudents: Array<{ id: number; name: string; percentage: number }>;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden'
};

const cardHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#64748b'
};

const cardBodyStyle: React.CSSProperties = {
  padding: '16px'
};

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/stats');
      return res.data;
    },
  });

  const todayPercentage = stats?.todayTotal ? Math.round((stats.todayPresent / stats.todayTotal) * 100) : 0;
  const lowAttendanceCount = stats?.lowAttendanceStudents?.length || 0;

  return (
    <div>
      {/* Page Title */}
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Students */}
        <div style={cardStyle}>
          <div style={cardBodyStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Total Students</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>
                  {isLoading ? '...' : stats?.totalStudents || 0}
                </p>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dbeafe',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Users size={20} color="#3b82f6" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Courses */}
        <div style={cardStyle}>
          <div style={cardBodyStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Active Courses</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>
                  {isLoading ? '...' : stats?.totalCourses || 0}
                </p>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dcfce7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BookOpen size={20} color="#22c55e" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div style={cardStyle}>
          <div style={cardBodyStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Today's Attendance</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>
                  {isLoading ? '...' : `${todayPercentage}%`}
                </p>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: todayPercentage >= 75 ? '#dcfce7' : '#fef3c7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ClipboardCheck size={20} color={todayPercentage >= 75 ? '#22c55e' : '#f59e0b'} />
              </div>
            </div>
          </div>
        </div>

        {/* Low Attendance */}
        <div style={cardStyle}>
          <div style={cardBodyStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Low Attendance</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>
                  {isLoading ? '...' : lowAttendanceCount}
                </p>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: lowAttendanceCount > 0 ? '#fee2e2' : '#f1f5f9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <TrendingDown size={20} color={lowAttendanceCount > 0 ? '#ef4444' : '#94a3b8'} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {/* Quick Actions */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Quick Actions</div>
          <div style={{ padding: '8px' }}>
            <Link
              to="/attendance"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#1e293b',
                marginBottom: '4px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#3b82f6',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ClipboardCheck size={18} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '14px' }}>Mark Attendance</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Record daily attendance</p>
              </div>
            </Link>

            <Link
              to="/students"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#1e293b',
                marginBottom: '4px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#22c55e',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Users size={18} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '14px' }}>Manage Students</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Add or edit students</p>
              </div>
            </Link>

            <Link
              to="/timetable"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#1e293b',
                marginBottom: '4px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#f59e0b',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Calendar size={18} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '14px' }}>View Timetable</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Class schedules</p>
              </div>
            </Link>

            <Link
              to="/reports"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#1e293b'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#8b5cf6',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BarChart2 size={18} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '14px' }}>Generate Reports</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Analytics & exports</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Today's Summary */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Today's Summary</div>
          <div style={cardBodyStyle}>
            {stats?.todayTotal ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: todayPercentage >= 75 ? '#dcfce7' : '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: todayPercentage >= 75 ? '#16a34a' : '#d97706'
                    }}>
                      {todayPercentage}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Present</span>
                  <span style={{ fontWeight: 600, color: '#22c55e' }}>{stats.todayPresent}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Absent</span>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>{stats.todayTotal - stats.todayPresent}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Total</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{stats.todayTotal}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <ClipboardCheck size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#64748b', marginBottom: '12px' }}>No attendance marked today</p>
                <Link
                  to="/attendance"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                  Mark attendance →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
