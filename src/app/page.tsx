'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import '@/styles/dashboard.css'; // เราจะใช้ CSS ของ Dashboard ที่มีอยู่แล้ว

export default function Dashboard() {
  const [stats, setStats] = useState({
    centers: 0,
    people: 0,
    requests: 0,
    alerts: 0
  });
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลจริงจากทุกระบบมาแสดง
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCenters, resPeople, resNotifs] = await Promise.all([
          fetch('/api/centers').then(res => res.json()),
          fetch('/api/beneficiaries').then(res => res.json()), // ✅ ตอนนี้ดึงจาก DB แล้ว
          fetch('/api/notifications').then(res => res.json())
        ]);

        // นับจำนวนต่างๆ
        const centersCount = Array.isArray(resCenters) ? resCenters.length : 0;
        const peopleCount = Array.isArray(resPeople) ? resPeople.length : 0;
        
        // นับเฉพาะคำร้องขอความช่วยเหลือ (Request) ที่ยังไม่อ่าน
        const pendingRequests = Array.isArray(resNotifs) 
          ? resNotifs.filter((n: any) => n.type === 'request' && !n.read).length 
          : 0;

        // นับประกาศฉุกเฉิน (Emergency)
        const activeAlerts = Array.isArray(resNotifs)
          ? resNotifs.filter((n: any) => n.type === 'emergency').length
          : 0;

        setStats({
          centers: centersCount,
          people: peopleCount,
          requests: pendingRequests,
          alerts: activeAlerts
        });
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // การ์ดแสดงผล (Component ย่อย)
  const StatCard = ({ title, value, icon, color, link, desc }: any) => (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <div className="stat-card" style={{ 
        background: `linear-gradient(135deg, ${color})`,
        cursor: 'pointer',
        transition: 'transform 0.2s'
      }}>
        <div className="stat-content">
          <div className="stat-info">
            <h3>{title}</h3>
            <div className="stat-number">{loading ? '...' : value.toLocaleString()}</div>
            <p className="stat-desc">{desc}</p>
          </div>
          <div className="stat-icon">{icon}</div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="page-container">
      <Header 
        title="ภาพรวมสถานการณ์" 
        subtitle={`อัปเดตล่าสุด: ${new Date().toLocaleTimeString('th-TH')}`} 
      />

      {/* Grid การ์ดสถิติ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard 
          title="ศูนย์พักพิงทั้งหมด" 
          value={stats.centers} 
          icon="🏢" 
          color="#7986cb, #5c6bc0" // สีม่วง
          link="/centers"
          desc="จำนวนศูนย์ที่เปิดใช้งาน"
        />
        <StatCard 
          title="ผู้ประสบภัย" 
          value={stats.people} 
          icon="👨‍👩‍👧‍👦" 
          color="#4db6ac, #26a69a" // สีเขียว
          link="/beneficiaries"
          desc="ลงทะเบียนเข้าพักแล้ว"
        />
        <StatCard 
          title="คำร้องขอความช่วยเหลือ" 
          value={stats.requests} 
          icon="🆘" 
          color="#ffb74d, #ffa726" // สีส้ม
          link="/notifications"
          desc="รอการดำเนินการ"
        />
        <StatCard 
          title="ประกาศฉุกเฉิน" 
          value={stats.alerts} 
          icon="📢" 
          color="#e57373, #ef5350" // สีแดง
          link="/emergency"
          desc="แจ้งเตือนภัยพิบัติล่าสุด"
        />
      </div>

      {/* แผนที่หรือกราฟ (ใส่ Placeholder ไว้ก่อน) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* กราฟจำลอง */}
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '300px' }}>
          <h3 style={{ marginTop: 0 }}>📈 แนวโน้มยอดผู้พักพิง (7 วันล่าสุด)</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', marginTop: '30px' }}>
            {/* สร้างกราฟแท่งด้วย CSS ง่ายๆ */}
            {[40, 60, 45, 80, 70, 90, stats.people > 0 ? stats.people : 100].map((h, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '10%' }}>
                <div style={{ width: '100%', height: `${h * 1.5}px`, background: i === 6 ? '#26a69a' : 'rgba(121, 134, 203, 0.3)', borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }}></div>
                <span style={{ fontSize: '12px', marginTop: '5px', color: 'var(--text-secondary)' }}>
                  {i === 6 ? 'วันนี้' : `${6-i} วันก่อน`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ทางลัด */}
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginTop: 0 }}>⚡ เมนูด่วน</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/emergency">
              <button className="btn-menu-shortcut" style={{ width: '100%', padding: '12px', background: 'rgba(239,83,80,0.1)', color: '#ef5350', border: '1px solid #ef5350', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                🚨 ประกาศภาวะฉุกเฉิน
              </button>
            </Link>
            <Link href="/beneficiaries">
              <button className="btn-menu-shortcut" style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                + ลงทะเบียนคนใหม่
              </button>
            </Link>
            <button 
              className="btn-menu-shortcut" 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => alert('ยังไม่เปิดใช้งาน')}
            >
              📄 พิมพ์รายงานสรุป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}