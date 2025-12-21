'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import '@/styles/dashboard.css'; // ใช้ CSS เดียวกับ Dashboard

interface Alert {
  id: number;
  title: string;
  level: 'info' | 'warning' | 'critical';
  type: string;
  timestamp: string;
  message: string;
}

export default function EmergencyPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentLevel, setCurrentLevel] = useState('normal'); // normal, watch, warning, critical

  useEffect(() => {
    fetch('/api/emergency/alerts').then(res => res.json()).then(setAlerts);
  }, []);

  const handleBroadcast = () => {
    const msg = prompt('ระบุข้อความแจ้งเตือนฉุกเฉิน (SMS/Line):');
    if (msg) {
      alert(`📡 ส่งข้อความ: "${msg}" \nไปยังหัวหน้าศูนย์ 944 ท่านเรียบร้อยแล้ว!`);
      // จำลองการเพิ่ม Log
      const newAlert = {
        id: Date.now(),
        title: 'ประกาศฉุกเฉินจากส่วนกลาง',
        level: 'critical' as const,
        type: 'broadcast',
        timestamp: new Date().toISOString(),
        message: msg
      };
      setAlerts([newAlert, ...alerts]);
    }
  };

  return (
    <div className="page-container">
      <Header title="🚨 ระบบบัญชาการฉุกเฉิน (War Room)" subtitle="ศูนย์สั่งการและกระจายข่าวสารภัยพิบัติ" />

      {/* 1. Status Control Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* การ์ดสถานะปัจจุบัน */}
        <div style={{ 
          background: 'var(--bg-card)', 
          padding: '25px', 
          borderRadius: '16px', 
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)' }}>สถานะความรุนแรงปัจจุบัน</h3>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: '900', 
            color: currentLevel === 'critical' ? '#ef5350' : currentLevel === 'warning' ? '#ffca28' : '#26a69a',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            {currentLevel === 'normal' && '🟢 ปกติ (Normal)'}
            {currentLevel === 'watch' && '🟡 เฝ้าระวัง (Watch)'}
            {currentLevel === 'warning' && '🟠 เตือนภัย (Warning)'}
            {currentLevel === 'critical' && '🔴 วิกฤต (Critical)'}
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={() => setCurrentLevel('normal')} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #26a69a', background: 'rgba(38,166,154,0.1)', color: '#26a69a', cursor: 'pointer' }}>ปกติ</button>
            <button onClick={() => setCurrentLevel('watch')} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ffca28', background: 'rgba(255,202,40,0.1)', color: '#ffca28', cursor: 'pointer' }}>เฝ้าระวัง</button>
            <button onClick={() => setCurrentLevel('critical')} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ef5350', background: 'rgba(239,83,80,0.1)', color: '#ef5350', cursor: 'pointer' }}>วิกฤต</button>
          </div>
        </div>

        {/* การ์ด Broadcast */}
        <div style={{ 
          background: 'linear-gradient(135deg, #b71c1c, #d32f2f)', 
          padding: '25px', 
          borderRadius: '16px', 
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 10px 20px rgba(211, 47, 47, 0.3)'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.9 }}>📢 กระจายข่าวฉุกเฉิน (Broadcast)</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '20px' }}>ส่ง SMS/Line แจ้งเตือนหัวหน้าศูนย์ทุกคนทันที</p>
          <button 
            onClick={handleBroadcast}
            style={{ 
              background: 'white', 
              color: '#c62828', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '30px', 
              fontSize: '1rem', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            กดเพื่อส่งข้อความแจ้งเตือน
          </button>
        </div>
      </div>

      {/* 2. Timeline Alerts */}
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>📜 ประวัติการแจ้งเตือนล่าสุด</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {alerts.map((alert) => (
          <div key={alert.id} style={{ 
            display: 'flex', 
            gap: '15px', 
            background: 'var(--bg-card)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--border-color)',
            borderLeft: `5px solid ${alert.level === 'critical' ? '#ef5350' : alert.level === 'warning' ? '#ffca28' : '#29b6f6'}`
          }}>
            <div style={{ fontSize: '2rem' }}>
              {alert.type === 'flood' && '🌊'}
              {alert.type === 'storm' && '⛈️'}
              {alert.type === 'general' && '📝'}
              {alert.type === 'broadcast' && '📢'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{alert.title}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {new Date(alert.timestamp).toLocaleTimeString('th-TH')} น.
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}