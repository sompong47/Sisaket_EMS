'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useSession, signOut } from 'next-auth/react'; // ✅ 1. Import เพิ่ม
import '@/styles/layout.css';

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession(); // ✅ 2. ดึงข้อมูล User

  const menuItems = [
    { name: 'ภาพรวม', icon: '', path: '/' },
    { name: ' ระบบบัญชาการฉุกเฉิน', icon: '', path: '/emergency' },
    { name: 'จัดการศูนย์พักพิง', icon: '', path: '/centers' },
    { name: 'รายชื่อผู้ประสบภัย', icon: '', path: '/beneficiaries' },
    { name: 'คลังสินค้า', icon: '', path: '/inventory' },
    { name: 'รายการเบิกจ่าย', icon: '', path: '/transfers' },
    { name: 'ประวัติการใช้งาน', icon: '', path: '/logs' }, 
  ];

  const publicItems = [
    { name: 'แจ้งขอความช่วยเหลือ', icon: '🆘', path: '/request' },
    { name: 'อัปเดตยอดผู้อพยพ', icon: '📊', path: '/update-population' },
  ];

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo" style={{ width: '220px', height: '50px', marginRight: '10px' }}>
          <img 
            src="/ssk-logo.jpg" 
            alt="Sisaket EMS Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>
        <div>
          <h2 className="sidebar-title">Sisaket EMS</h2>
          <p className="sidebar-subtitle">ระบบบริหารจัดการภาวะฉุกเฉิน</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        
        {/* ✅ 3. Admin Menu: แสดงเฉพาะ Admin */}
        {session?.user?.role === 'admin' && (
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
        )}

        {/* Public Menu (Staff เห็นได้ทุกคน) */}
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

      {/* Footer & Actions */}
      <div className="sidebar-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        
        {/* ✅ 4. โปรไฟล์ผู้ใช้ (ดึงจาก Session) */}
        <div className="user-profile-sidebar" style={{ flex: 1, minWidth: 0 }}>
          <div 
            className="user-avatar-sidebar" 
            style={{ background: session?.user?.role === 'admin' ? '#ef4444' : '#3b82f6' }}
          >
            {session?.user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-info-sidebar">
            <div className="user-role-sidebar">
              {session?.user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}
            </div>
            <div className="user-name-sidebar" title={session?.user?.name || 'Guest'}>
              {session?.user?.name || 'Guest'}
            </div>
          </div>
        </div>

        {/* ปุ่มสลับโหมด */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '1rem', color: 'var(--text-primary)'
          }}
          className="theme-btn-hover"
          title="เปลี่ยนธีม"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>

        {/* ✅ 5. ปุ่มออกจากระบบ (Logout) */}
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '1rem', color: '#dc2626'
          }}
          className="theme-btn-hover"
          title="ออกจากระบบ"
        >
          🚪
        </button>

      </div>
    </aside>
  );
}