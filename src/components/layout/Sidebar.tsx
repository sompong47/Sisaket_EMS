'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import '@/styles/layout.css';

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

const menuItems = [
    { name: 'ภาพรวม', icon: '📈', path: '/' },
    { name: '⚠️ ระบบบัญชาการฉุกเฉิน', icon: '🚨', path: '/emergency' },
    { name: 'จัดการศูนย์พักพิง', icon: '🏕️', path: '/centers' },
    { name: 'รายชื่อผู้ประสบภัย', icon: '👤', path: '/beneficiaries' },
    { name: 'คลังสินค้า', icon: '📦', path: '/inventory' },
    { name: 'รายการเบิกจ่าย', icon: '🚛', path: '/transfers' },
    { name: 'ประวัติการใช้งาน', icon: '📋', path: '/logs' }, 
  ];

  const publicItems = [
    { name: 'แจ้งขอความช่วยเหลือ', icon: '🆘', path: '/request' },
    { name: 'อัปเดตยอดผู้อพยพ', icon: '📊', path: '/update-population' },
  ];

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img 
            src="/ssk-logo.jpg" 
            alt="Sisaket EMS Logo" 
            style={{
              width: '30%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
        <div>
          <h2 className="sidebar-title">Sisaket EMS</h2>
          <p className="sidebar-subtitle">ระบบบริหารจัดการภาวะฉุกเฉิน</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        
        {/* Admin Menu */}
        <div className="nav-section">
          <div className="section-label">ADMIN MENU</div>
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`nav-link ${pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Public Menu (Staff) */}
        <div className="nav-section">
          <div className="section-label">สำหรับศูนย์พักพิง</div>
          {publicItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`nav-link public ${pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer & Theme Toggle */}
      <div className="sidebar-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        
        {/* โปรไฟล์ผู้ใช้ */}
        <div className="user-profile-sidebar" style={{ flex: 1 }}>
          <div className="user-avatar-sidebar">A</div>
          <div className="user-info-sidebar">
            <div className="user-role-sidebar">ผู้ดูแลระบบ</div>
            <div className="user-name-sidebar">Admin</div>
          </div>
        </div>

        {/* ปุ่มสลับโหมด */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: 'var(--text-primary)',
            transition: 'background 0.2s'
          }}
          className="theme-btn-hover"
          title={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>

      </div>
    </aside>
  );
}