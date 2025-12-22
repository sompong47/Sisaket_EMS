'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/styles/layout.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: (text: string) => void;
}

// สร้าง Interface สำหรับ Notification
interface Notification {
  id: number;
  type: string;
  title: string;
  time: string;
  read: boolean;
}

export default function Header({ title, subtitle, showSearch = false, onSearch }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ ดึงข้อมูลจริงจาก API เมื่อโหลดหน้า
  useEffect(() => {
    fetchNotifications();
    
    // (Optional) ตั้งเวลาดึงข้อมูลใหม่ทุก 1 นาที (Polling)
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
      // นับจำนวนที่ยังไม่อ่าน (read: false)
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // ฟังก์ชันเลือกไอคอนและสี (เหมือนในหน้า NotificationsPage)
  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency': return { icon: '📢', className: 'danger' };
      case 'request': return { icon: '🆘', className: 'warn' };
      case 'stock': return { icon: '📦', className: 'info' }; // ใช้สี info แทน warn
      case 'system': return { icon: '✅', className: 'success' };
      default: return { icon: 'ℹ️', className: '' };
    }
  };

  return (
    <header className="page-header">
      {/* ฝั่งซ้าย: หัวข้อ */}
      <div className="header-content">
        <div className="header-title-section">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
        
        {/* ฝั่งขวา: เครื่องมือต่างๆ */}
        <div className="header-actions">
          
          {/* 1. ช่องค้นหา */}
          {showSearch && (
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="ค้นหาข้อมูล..." 
                className="search-input"
                onChange={(e) => onSearch && onSearch(e.target.value)}
              />
            </div>
          )}

          {/* 2. ปุ่มกระดิ่งแจ้งเตือน */}
          <div className="notification-wrapper">
            <button 
              className={`notification-button ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="notification-icon">🔔</span>
              {/* ✅ แสดงจุดแดงเฉพาะเมื่อมีข้อความยังไม่อ่าน */}
              {unreadCount > 0 && <span className="notification-badge"></span>}
            </button>
            
            {/* Dropdown แจ้งเตือน */}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>การแจ้งเตือน</h3>
                  {/* ✅ แสดงตัวเลขจริง */}
                  {unreadCount > 0 && <span className="notification-count-badge">{unreadCount}</span>}
                </div>
                
                <div className="notification-list">
                  {/* ✅ วนลูปแสดงข้อมูลจริง (เอาแค่ 5 อันล่าสุดพอ) */}
                  {notifications.slice(0, 5).map((item) => {
                    const { icon, className } = getIcon(item.type);
                    return (
                      <div key={item.id} className={`notification-item ${!item.read ? 'unread' : ''}`}>
                        <div className={`notification-icon-box ${className}`}>
                          {icon}
                        </div>
                        <div className="notification-text">
                          <p className="notif-title">{item.title}</p>
                          <p className="notif-time">{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {notifications.length === 0 && (
                     <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>ไม่มีการแจ้งเตือน</div>
                  )}
                </div>

                <Link href="/notifications" style={{ textDecoration: 'none' }}>
                   <button className="notification-view-all">ดูทั้งหมด</button>
                </Link>
              </div>
            )}
          </div>

          {/* 3. User Profile */}
          <div className="user-profile">
            <div className="user-info">
              <div className="user-name">Admin Officer</div>
              <div className="user-status">
                <span className="status-indicator"></span>
                <span className="status-text">ออนไลน์</span>
              </div>
            </div>
            <div className="user-avatar">AD</div>
          </div>
        </div>
      </div>
    </header>
  );
}