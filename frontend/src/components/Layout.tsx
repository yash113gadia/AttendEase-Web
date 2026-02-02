import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  LogOut,
  Menu,
  X,
  Calendar,
  BarChart2
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { path: '/courses', label: 'Courses', icon: BookOpen },
  { path: '/timetable', label: 'Timetable', icon: Calendar },
  { path: '/reports', label: 'Reports', icon: BarChart2 },
];

export default function Layout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Mobile menu backdrop */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Header */}
      <header style={{
        backgroundColor: '#1e3a5f',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer',
                display: 'block'
              }}
              className="lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#3b82f6',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClipboardCheck size={18} color="white" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '18px' }}>AttendEase</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: '4px' }} className="hidden lg:flex">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '280px',
          height: '100%',
          backgroundColor: '#1e3a5f',
          zIndex: 50,
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s'
        }}
        className="lg:hidden"
      >
        <div style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              padding: '8px',
              border: 'none',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>
        <nav style={{ padding: '12px' }}>
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  marginBottom: '4px'
                }}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        <Outlet />
      </main>
    </div>
  );
}
