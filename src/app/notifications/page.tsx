'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import '@/styles/table.css'; // ใช้ CSS พื้นฐานร่วมกัน

interface Notification {
  id: number;
  type: 'emergency' | 'request' | 'stock' | 'system' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetch('/api/notifications').then(res => res.json()).then(setNotifs);
  }, []);

  // ฟังก์ชันเลือกไอคอนและสีตามประเภท
  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency': return { icon: '📢', bg: '#ffebee', color: '#c62828' }; // แดง
      case 'request': return { icon: '🆘', bg: '#fff3e0', color: '#ef6c00' };   // ส้ม
      case 'stock': return { icon: '📦', bg: '#e3f2fd', color: '#1565c0' };     // ฟ้า
      case 'system': return { icon: '✅', bg: '#e8f5e9', color: '#2e7d32' };    // เขียว
      default: return { icon: 'ℹ️', bg: '#f5f5f5', color: '#616161' };          // เทา
    }
  };

  const handleMarkAllRead = () => {
    // จำลองการเปลี่ยนสถานะ
    const updated = notifs.map(n => ({ ...n, read: true }));
    setNotifs(updated);
    alert('✅ อ่านทั้งหมดเรียบร้อย');
  };

  const filteredNotifs = filter === 'all' ? notifs : notifs.filter(n => !n.read);

  return (
    <div className="page-container">
      <Header title="🔔 ศูนย์รวมการแจ้งเตือน" subtitle="ติดตามสถานะและเหตุการณ์ล่าสุด" />

      {/* Toolbar */}
      <div className="filter-section" style={{ marginBottom: '20px' }}>
        <div className="filter-group">
          <button 
            className={`btn-filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            style={{ 
              padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)',
              background: filter === 'all' ? 'var(--text-primary)' : 'transparent',
              color: filter === 'all' ? 'var(--bg-card)' : 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            ทั้งหมด
          </button>
          <button 
            className={`btn-filter ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
            style={{ 
              padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)',
              background: filter === 'unread' ? 'var(--text-primary)' : 'transparent',
              color: filter === 'unread' ? 'var(--bg-card)' : 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            ยังไม่ได้อ่าน
          </button>
        </div>

        <button className="btn-reset" style={{ width: 'auto', padding: '0 15px' }} onClick={handleMarkAllRead}>
          ✓ อ่านทั้งหมด
        </button>
      </div>

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredNotifs.map((item) => {
          const style = getIcon(item.type);
          return (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'start',
              gap: '15px',
              padding: '20px',
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: `1px solid ${item.read ? 'var(--border-color)' : 'var(--accent-purple)'}`, // อันไหนยังไม่อ่านขอบสีม่วง
              borderLeft: !item.read ? '5px solid var(--accent-purple)' : '1px solid var(--border-color)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}>
              {/* Icon Box */}
              <div style={{
                minWidth: '45px', height: '45px',
                borderRadius: '10px',
                background: style.bg,
                color: style.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {style.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {item.title} 
                    {!item.read && <span style={{ marginLeft: '10px', fontSize: '0.7rem', background: '#ef5350', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>ใหม่</span>}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.message}</p>
              </div>
            </div>
          );
        })}

        {filteredNotifs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
            🎉 ไม่มีรายการแจ้งเตือน
          </div>
        )}
      </div>
    </div>
  );
}